#!/usr/bin/env python3
"""
Debug script to check configuration and API connectivity.
Run this to diagnose issues with the Live Optimizing Classifier.
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_environment():
    """Check environment variables and configuration."""
    print("🔍 Checking Environment Configuration...")
    
    # Check provider
    provider = os.getenv("PROVIDER", "openai")
    print(f"Provider: {provider}")
    
    # Check API keys
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if provider == "openai":
        if openai_key:
            print(f"✅ OpenAI API Key: {openai_key[:10]}...")
        else:
            print("❌ OpenAI API Key: Not found")
            return False
    elif provider == "anthropic":
        if anthropic_key:
            print(f"✅ Anthropic API Key: {anthropic_key[:10]}...")
        else:
            print("❌ Anthropic API Key: Not found")
            return False
    
    return True

def check_config_file():
    """Check if config.yaml is valid."""
    print("\n📄 Checking Configuration File...")
    
    try:
        from config import load_config
        config = load_config()
        print("✅ Config file loaded successfully")
        print(f"Labels: {config['labels']}")
        print(f"Provider: {config['provider']['name']}")
        print(f"Model: {config['provider']['model']}")
        print(f"Variant count: {config['variant_count']}")
        return True
    except Exception as e:
        print(f"❌ Config file error: {str(e)}")
        return False

async def test_dspy_setup():
    """Test DSPy configuration."""
    print("\n🧠 Testing DSPy Setup...")
    
    try:
        import dspy
        from config import load_config, get_api_key
        
        config = load_config()
        provider_config = config["provider"]
        provider_name = provider_config["name"].lower()
        
        if provider_name == "openai":
            api_key = get_api_key("openai")
            lm = dspy.OpenAI(
                model=provider_config["model"],
                api_key=api_key,
                max_tokens=50
            )
        elif provider_name == "anthropic":
            api_key = get_api_key("anthropic")
            lm = dspy.Claude(
                model=provider_config["model"],
                api_key=api_key,
                max_tokens=50
            )
        else:
            print(f"❌ Unsupported provider: {provider_name}")
            return False
        
        dspy.settings.configure(lm=lm)
        print("✅ DSPy configured successfully")
        return True
        
    except Exception as e:
        print(f"❌ DSPy setup error: {str(e)}")
        return False

async def test_simple_prediction():
    """Test a simple prediction."""
    print("\n🎯 Testing Simple Prediction...")
    
    try:
        import dspy
        from optimizer import ClassifyAndSummarize
        
        # Create predictor
        predictor = dspy.Predict(ClassifyAndSummarize)
        
        # Test input
        test_text = "I was charged twice for my subscription"
        
        print(f"Testing with: '{test_text}'")
        
        # Make prediction
        result = await asyncio.to_thread(predictor, text=test_text)
        
        print(f"✅ Prediction successful!")
        print(f"Category: {result.category}")
        print(f"Summary: {result.summary}")
        return True
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return False

async def main():
    """Run all diagnostic checks."""
    print("🚀 Live Optimizing Classifier - Diagnostic Tool\n")
    
    checks = [
        ("Environment", check_environment()),
        ("Config File", check_config_file()),
        ("DSPy Setup", await test_dspy_setup()),
        ("Simple Prediction", await test_simple_prediction())
    ]
    
    print("\n📊 Summary:")
    all_passed = True
    for name, passed in checks:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All checks passed! The application should work correctly.")
    else:
        print("\n⚠️ Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())