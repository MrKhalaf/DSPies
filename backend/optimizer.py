"""
DSPy-based prompt optimizer for the Live Optimizing Classifier.
Manages multiple prompt variants and orchestrates the optimization process.
"""

import dspy
import asyncio
import json
import time
from typing import Dict, List, Any, Optional
import logging

from models import (
    Variant, VariantOutput, Score, ScoreComponents, EventType, 
    create_variant_id, create_event
)
from scoring import VariantScorer
from config import get_api_key

logger = logging.getLogger(__name__)

class ClassifyAndSummarize(dspy.Signature):
    """DSPy signature for classification and summarization task."""
    text: str = dspy.InputField(desc="Text to classify and summarize")
    category: str = dspy.OutputField(desc="Classification category from allowed labels")
    summary: str = dspy.OutputField(desc="One-sentence summary (≤20 words, declarative)")

class DSPyOptimizer:
    """
    Manages DSPy prompt optimization with multiple variants.
    Coordinates variant execution, scoring, and event emission.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.scorer = VariantScorer(config)
        self._setup_dspy()
        self._create_variants()
    
    def _setup_dspy(self) -> None:
        """Initialize DSPy with the configured LLM provider."""
        provider_config = self.config["provider"]
        provider_name = provider_config["name"].lower()
        
        logger.info(f"Setting up DSPy with provider: {provider_name}")
        
        try:
            if provider_name == "openai":
                logger.info("Configuring OpenAI provider")
                api_key = get_api_key("openai")
                logger.info(f"API key found: {api_key[:10]}..." if api_key else "No API key found")
                lm = dspy.OpenAI(
                    model=provider_config["model"],
                    api_key=api_key,
                    max_tokens=200  # Keep responses concise
                )
            elif provider_name == "anthropic":
                logger.info("Configuring Anthropic provider")
                api_key = get_api_key("anthropic")
                logger.info(f"API key found: {api_key[:10]}..." if api_key else "No API key found")
                lm = dspy.Claude(
                    model=provider_config["model"],
                    api_key=api_key,
                    max_tokens=200
                )
            else:
                raise ValueError(f"Unsupported provider: {provider_name}")
            
            dspy.settings.configure(lm=lm)
            logger.info(f"Successfully configured DSPy with {provider_name} provider using model {provider_config['model']}")
            
        except Exception as e:
            logger.error(f"Failed to configure DSPy: {str(e)}", exc_info=True)
            raise
    
    def _create_variants(self) -> None:
        """Create prompt variants with different specifications."""
        self.variants = []
        temperatures = self.config["provider"]["temperature"]
        
        # Variant 1: Direct, formal approach
        variant1_spec = {
            "instruction": "Classify the text into one of the provided categories and write a concise summary.",
            "style": "formal",
            "temperature": temperatures[0],
            "examples": [
                ("I can't log into my account", "technical", "User experiencing login difficulties"),
                ("Please cancel my subscription", "cancellation", "Customer requesting subscription cancellation")
            ]
        }
        
        # Variant 2: Conversational, helpful approach
        variant2_spec = {
            "instruction": "Help classify this customer message and summarize what they need.",
            "style": "conversational", 
            "temperature": temperatures[1],
            "examples": [
                ("My bill seems wrong this month", "billing", "Customer questioning billing accuracy"),
                ("This is really urgent!", "urgent", "Customer expressing urgency")
            ]
        }
        
        # Variant 3: Analytical, detailed approach
        variant3_spec = {
            "instruction": "Analyze the text to determine the primary intent category and provide a factual summary.",
            "style": "analytical",
            "temperature": temperatures[2],
            "examples": [
                ("The app keeps crashing", "technical", "Application experiencing stability issues"),
                ("I need help with billing", "billing", "Customer seeking billing assistance")
            ]
        }
        
        specs = [variant1_spec, variant2_spec, variant3_spec]
        
        for i, spec in enumerate(specs[:self.config["variant_count"]]):
            variant = Variant(
                variant_id=create_variant_id(i),
                prompt_spec=f"{spec['style'].title()} approach: {spec['instruction']}"
            )
            self.variants.append((variant, spec))
    
    async def optimize(self, run_id: str, input_text: str, run_store: Any) -> None:
        """
        Run the optimization process for a given input.
        Executes variants, scores them, and emits events.
        """
        logger.info(f"Starting optimization for run {run_id} with {len(self.variants)} variants")
        
        try:
            # Process each variant
            variant_results = []
            
            for variant, spec in self.variants:
                # Emit variant start event
                run_store.add_event(run_id, {
                    "type": EventType.VARIANT_START,
                    "ts": time.time() * 1000,
                    "payload": {
                        "variant_id": variant.variant_id,
                        "prompt_spec": variant.prompt_spec
                    }
                })
                
                # Execute variant with timeout
                try:
                    logger.info(f"Executing variant {variant.variant_id} for run {run_id}")
                    result = await self._execute_variant(variant, spec, input_text)
                    variant_results.append(result)
                    logger.info(f"Variant {variant.variant_id} completed with result: {result.output is not None}")
                    
                    # Add to run store
                    run_store.add_variant(run_id, result)
                    
                    # Emit variant output event
                    run_store.add_event(run_id, {
                        "type": EventType.VARIANT_OUTPUT,
                        "ts": time.time() * 1000,
                        "payload": {
                            "variant_id": variant.variant_id,
                            "output": result.output.model_dump() if result.output else None,
                            "latency_ms": result.latency_ms,
                            "error": result.error
                        }
                    })
                    
                    # Score the variant if we got output
                    if result.output:
                        score = self.scorer.score_variant(result, input_text)
                        run_store.add_score(run_id, score)
                        
                        # Emit scoring event
                        run_store.add_event(run_id, {
                            "type": EventType.VARIANT_SCORED,
                            "ts": time.time() * 1000,
                            "payload": {
                                "variant_id": variant.variant_id,
                                "score": score.model_dump()
                            }
                        })
                        
                        # Check if this is the new leader
                        current_leader = self._get_current_leader(run_store, run_id)
                        if current_leader != variant.variant_id:
                            run_store.add_event(run_id, {
                                "type": EventType.LEADER_CHANGE,
                                "ts": time.time() * 1000,
                                "payload": {
                                    "new_leader": variant.variant_id,
                                    "previous_leader": current_leader
                                }
                            })
                
                except asyncio.TimeoutError:
                    logger.warning(f"Variant {variant.variant_id} timed out")
                    result = Variant(
                        variant_id=variant.variant_id,
                        prompt_spec=variant.prompt_spec,
                        error="Timeout"
                    )
                    variant_results.append(result)
                    run_store.add_variant(run_id, result)
                
                except Exception as e:
                    logger.error(f"Error executing variant {variant.variant_id}: {str(e)}")
                    result = Variant(
                        variant_id=variant.variant_id,
                        prompt_spec=variant.prompt_spec,
                        error=str(e)
                    )
                    variant_results.append(result)
                    run_store.add_variant(run_id, result)
            
            # Determine winner
            winner_id = self._select_winner(run_store, run_id)
            if winner_id:
                run_store.set_winner(run_id, winner_id)
            
            # Emit completion event
            run_store.add_event(run_id, {
                "type": EventType.RUN_COMPLETE,
                "ts": time.time() * 1000,
                "payload": {
                    "winner_variant_id": winner_id,
                    "total_variants": len(variant_results)
                }
            })
            
            logger.info(f"Completed optimization for run {run_id}, winner: {winner_id}")
            
        except Exception as e:
            logger.error(f"Optimization failed for run {run_id}: {str(e)}")
            run_store.add_event(run_id, {
                "type": EventType.ERROR,
                "ts": time.time() * 1000,
                "payload": {"error": str(e)}
            })
            raise
    
    async def _execute_variant(self, variant: Variant, spec: Dict[str, Any], input_text: str) -> Variant:
        """Execute a single variant with the given specification."""
        start_time = time.time()
        
        try:
            logger.info(f"Creating predictor for variant {variant.variant_id}")
            # Create a predictor with the variant's configuration
            predictor = dspy.Predict(ClassifyAndSummarize)
            
            # Build the prompt context
            labels_str = ", ".join(self.config["labels"])
            context = f"Available categories: {labels_str}\n\n"
            
            # Add examples if specified
            if "examples" in spec:
                context += "Examples:\n"
                for text, cat, summ in spec["examples"]:
                    context += f"Text: {text}\nCategory: {cat}\nSummary: {summ}\n\n"
            
            # Add instruction
            context += f"Instructions: {spec['instruction']}\n\n"
            context += f"Text to classify: {input_text}"
            
            logger.info(f"Built context for variant {variant.variant_id}: {context[:100]}...")
            
            # Execute with timeout
            timeout = self.config["timeouts_ms"]["per_variant"] / 1000.0
            logger.info(f"Executing variant {variant.variant_id} with timeout {timeout}s")
            
            result = await asyncio.wait_for(
                asyncio.to_thread(predictor, text=context),
                timeout=timeout
            )
            
            latency_ms = int((time.time() - start_time) * 1000)
            logger.info(f"Variant {variant.variant_id} completed in {latency_ms}ms")
            logger.info(f"Raw result for variant {variant.variant_id}: {result}")
            
            # Parse the output
            output = VariantOutput(
                category=result.category.strip(),
                summary=result.summary.strip()
            )
            
            logger.info(f"Parsed output for variant {variant.variant_id}: category={output.category}, summary={output.summary[:50]}...")
            
            return Variant(
                variant_id=variant.variant_id,
                prompt_spec=variant.prompt_spec,
                output=output,
                latency_ms=latency_ms
            )
            
        except asyncio.TimeoutError:
            logger.warning(f"Variant {variant.variant_id} timed out after {timeout}s")
            raise
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Error executing variant {variant.variant_id}: {str(e)}", exc_info=True)
            return Variant(
                variant_id=variant.variant_id,
                prompt_spec=variant.prompt_spec,
                latency_ms=latency_ms,
                error=str(e)
            )
    
    def _get_current_leader(self, run_store: Any, run_id: str) -> Optional[str]:
        """Get the current leading variant based on scores."""
        scores = run_store.get_run(run_id).get("scores", [])
        if not scores:
            return None
        
        # Find highest scoring variant
        best_score = max(scores, key=lambda s: s["total"])
        return best_score["variant_id"]
    
    def _select_winner(self, run_store: Any, run_id: str) -> Optional[str]:
        """Select the winning variant based on scores and latency."""
        run_data = run_store.get_run(run_id)
        scores = run_data.get("scores", [])
        variants = run_data.get("variants", [])
        
        if not scores:
            return None
        
        # Sort by score (descending), then by latency (ascending)
        def sort_key(score_data):
            variant_id = score_data["variant_id"]
            variant = next((v for v in variants if v["variant_id"] == variant_id), None)
            latency = variant.get("latency_ms", float('inf')) if variant else float('inf')
            return (-score_data["total"], latency)
        
        sorted_scores = sorted(scores, key=sort_key)
        return sorted_scores[0]["variant_id"] if sorted_scores else None