"""
Deterministic scoring system for variant evaluation.
Implements rule-based scoring without LLM calls for fast, consistent evaluation.
"""

import re
import json
from typing import Dict, List, Any
import logging

from models import Variant, Score, ScoreComponents

logger = logging.getLogger(__name__)

class VariantScorer:
    """
    Deterministic scorer for variant outputs.
    Uses rule-based heuristics to evaluate quality without LLM calls.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.weights = config["weights"]
        self.labels = set(config["labels"])
        
        # Intent detection patterns
        self.intent_patterns = {
            "billing": [
                r"\b(bill|billing|charge|payment|invoice|refund|double.?charged?|cost|price|fee)\b",
                r"\b(money|dollar|amount|subscription|plan)\b"
            ],
            "technical": [
                r"\b(bug|error|crash|broken|not.?work|issue|problem|login|app|website|connection)\b",
                r"\b(technical|tech|system|server|down|slow)\b"
            ],
            "cancellation": [
                r"\b(cancel|stop|end|terminate|quit|unsubscribe|delete.?account)\b",
                r"\b(don.?t.?want|no.?longer|remove)\b"
            ],
            "urgent": [
                r"\b(urgent|emergency|asap|immediately|now|critical|important)\b",
                r"\b(help.?me|need.?help|stuck|locked.?out)\b"
            ],
            "other": []  # Fallback category
        }
        
        # Hedging phrases to penalize
        self.hedging_patterns = [
            r"\b(i think|i believe|maybe|perhaps|possibly|might be|could be|seems like)\b",
            r"\b(as an ai|i'm an ai|i cannot|i don't know|uncertain)\b",
            r"\b(probably|likely|appears to|suggests)\b"
        ]
    
    def score_variant(self, variant: Variant, input_text: str) -> Score:
        """
        Score a variant's output using deterministic rules.
        
        Args:
            variant: The variant to score
            input_text: Original input text for intent detection
            
        Returns:
            Score object with total and component scores
        """
        if not variant.output:
            # Return zero score for failed variants
            return Score(
                variant_id=variant.variant_id,
                total=0.0,
                components=ScoreComponents(
                    label_valid=0.0,
                    label_match=0.0,
                    summary_len_ok=0.0,
                    no_hedging=0.0,
                    format_ok=0.0
                )
            )
        
        output = variant.output
        
        # Calculate individual components
        label_valid = self._score_label_valid(output.category)
        label_match = self._score_label_match(output.category, input_text)
        summary_len_ok = self._score_summary_length(output.summary)
        no_hedging = self._score_no_hedging(output.summary)
        format_ok = self._score_format_ok(output)
        
        # Calculate weighted total
        total = (
            label_valid * self.weights["label_valid"] +
            label_match * self.weights["label_match"] +
            summary_len_ok * self.weights["summary_len_ok"] +
            no_hedging * self.weights["no_hedging"] +
            format_ok * self.weights["format_ok"]
        )
        
        components = ScoreComponents(
            label_valid=label_valid,
            label_match=label_match,
            summary_len_ok=summary_len_ok,
            no_hedging=no_hedging,
            format_ok=format_ok
        )
        
        logger.debug(f"Scored variant {variant.variant_id}: {total:.2f} {components}")
        
        return Score(
            variant_id=variant.variant_id,
            total=total,
            components=components
        )
    
    def _score_label_valid(self, category: str) -> float:
        """Score whether the category is in the allowed labels."""
        return 1.0 if category.lower() in {label.lower() for label in self.labels} else 0.0
    
    def _score_label_match(self, category: str, input_text: str) -> float:
        """Score whether the category matches the detected intent from input."""
        detected_intent = self._detect_intent(input_text)
        
        # If we couldn't detect intent, give partial credit
        if detected_intent == "other":
            return 0.5
        
        # Check if predicted category matches detected intent
        return 1.0 if category.lower() == detected_intent.lower() else 0.0
    
    def _score_summary_length(self, summary: str) -> float:
        """Score whether the summary is ≤20 words."""
        word_count = len(summary.split())
        return 1.0 if word_count <= 20 else max(0.0, 1.0 - (word_count - 20) * 0.1)
    
    def _score_no_hedging(self, summary: str) -> float:
        """Score based on absence of hedging phrases."""
        text_lower = summary.lower()
        
        for pattern in self.hedging_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return 0.0
        
        return 1.0
    
    def _score_format_ok(self, output: Any) -> float:
        """Score whether the output is properly formatted."""
        try:
            # Check if we have both required fields
            if not hasattr(output, 'category') or not hasattr(output, 'summary'):
                return 0.0
            
            # Check if fields are non-empty strings
            if not isinstance(output.category, str) or not isinstance(output.summary, str):
                return 0.0
            
            if not output.category.strip() or not output.summary.strip():
                return 0.0
            
            return 1.0
            
        except Exception:
            return 0.0
    
    def _detect_intent(self, input_text: str) -> str:
        """
        Detect the most likely intent from input text using pattern matching.
        
        Args:
            input_text: The input text to analyze
            
        Returns:
            The detected intent category
        """
        text_lower = input_text.lower()
        intent_scores = {}
        
        # Score each intent based on pattern matches
        for intent, patterns in self.intent_patterns.items():
            if intent == "other":
                continue
                
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
                score += matches
            
            if score > 0:
                intent_scores[intent] = score
        
        # Return the intent with the highest score, or "other" if no matches
        if intent_scores:
            return max(intent_scores.items(), key=lambda x: x[1])[0]
        else:
            return "other"
    
    def explain_score(self, score: Score, variant: Variant, input_text: str) -> Dict[str, Any]:
        """
        Generate an explanation of why a variant received its score.
        
        Args:
            score: The score to explain
            variant: The variant that was scored
            input_text: Original input text
            
        Returns:
            Dictionary with explanation details
        """
        if not variant.output:
            return {"explanation": "Variant failed to produce output"}
        
        explanations = []
        
        # Label validity
        if score.components.label_valid == 1.0:
            explanations.append("✓ Category is valid")
        else:
            explanations.append(f"✗ Invalid category '{variant.output.category}'")
        
        # Label match
        detected_intent = self._detect_intent(input_text)
        if score.components.label_match == 1.0:
            explanations.append(f"✓ Category matches detected intent ({detected_intent})")
        elif score.components.label_match == 0.5:
            explanations.append("~ No clear intent detected")
        else:
            explanations.append(f"✗ Category doesn't match detected intent ({detected_intent})")
        
        # Summary length
        word_count = len(variant.output.summary.split())
        if score.components.summary_len_ok == 1.0:
            explanations.append(f"✓ Summary length OK ({word_count} words)")
        else:
            explanations.append(f"✗ Summary too long ({word_count} words)")
        
        # No hedging
        if score.components.no_hedging == 1.0:
            explanations.append("✓ No hedging phrases")
        else:
            explanations.append("✗ Contains hedging phrases")
        
        # Format
        if score.components.format_ok == 1.0:
            explanations.append("✓ Proper format")
        else:
            explanations.append("✗ Format issues")
        
        return {
            "total_score": score.total,
            "explanations": explanations,
            "detected_intent": detected_intent,
            "word_count": word_count if variant.output else 0
        }