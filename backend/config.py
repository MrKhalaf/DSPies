"""
Configuration management for the Live Optimizing Classifier.
Loads and validates configuration from YAML and environment variables.
"""

import yaml
import os
from typing import Dict, Any, List
from pathlib import Path

def load_config() -> Dict[str, Any]:
    """
    Load configuration from config.yaml and environment variables.
    Environment variables override YAML settings.
    """
    # Load base config from YAML
    config_path = Path(__file__).parent / "config.yaml"
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Override with environment variables
    if os.getenv("PROVIDER"):
        config["provider"]["name"] = os.getenv("PROVIDER")
    
    if os.getenv("MODEL_NAME"):
        config["provider"]["model"] = os.getenv("MODEL_NAME")
    
    if os.getenv("TEMPERATURE_VARIANTS"):
        temps = [float(t.strip()) for t in os.getenv("TEMPERATURE_VARIANTS").split(",")]
        config["provider"]["temperature"] = temps
    
    # Validate configuration
    _validate_config(config)
    
    return config

def _validate_config(config: Dict[str, Any]) -> None:
    """Validate configuration values."""
    required_keys = ["labels", "variant_count", "max_input_chars", "timeouts_ms", "weights", "provider"]
    
    for key in required_keys:
        if key not in config:
            raise ValueError(f"Missing required configuration key: {key}")
    
    # Validate labels
    if not isinstance(config["labels"], list) or len(config["labels"]) == 0:
        raise ValueError("Labels must be a non-empty list")
    
    # Validate variant count
    if config["variant_count"] < 1:
        raise ValueError("Variant count must be at least 1")
    
    # Validate timeouts
    timeouts = config["timeouts_ms"]
    if timeouts["per_variant"] <= 0 or timeouts["run_total"] <= 0:
        raise ValueError("Timeouts must be positive")
    
    # Validate weights
    weights = config["weights"]
    required_weights = ["label_valid", "label_match", "summary_len_ok", "no_hedging", "format_ok"]
    for weight in required_weights:
        if weight not in weights or weights[weight] < 0:
            raise ValueError(f"Weight {weight} must be non-negative")
    
    # Validate provider
    provider = config["provider"]
    if "name" not in provider or "model" not in provider:
        raise ValueError("Provider must specify name and model")
    
    # Ensure temperature list matches variant count
    if len(provider["temperature"]) != config["variant_count"]:
        # Extend or truncate to match variant count
        temps = provider["temperature"]
        if len(temps) < config["variant_count"]:
            # Repeat last temperature
            temps.extend([temps[-1]] * (config["variant_count"] - len(temps)))
        else:
            # Truncate
            temps = temps[:config["variant_count"]]
        config["provider"]["temperature"] = temps

def get_api_key(provider_name: str) -> str:
    """Get API key for the specified provider."""
    key_map = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "azure": "AZURE_OPENAI_API_KEY"
    }
    
    env_var = key_map.get(provider_name.lower())
    if not env_var:
        raise ValueError(f"Unknown provider: {provider_name}")
    
    api_key = os.getenv(env_var)
    if not api_key:
        raise ValueError(f"Missing API key: {env_var}")
    
    return api_key