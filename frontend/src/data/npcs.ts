export interface NPCDef {
  id: string;
  name: string;
  position: { x: number; z: number };
  bodyColor: string;
  accentColor: string;
  accessory: 'glasses' | 'notebook' | 'toolbelt' | 'magnifier' | 'clipboard' | 'none';
  dialogue: string[];
  concept: {
    name: string;
    description: string;
  };
}

export const npcs: NPCDef[] = [
  {
    id: 'professor',
    name: 'Prof. Oak-sley',
    position: { x: 0, z: -5 },
    bodyColor: '#ffffff',
    accentColor: '#4a90d9',
    accessory: 'glasses',
    dialogue: [
      "Welcome to DSPyville! I'm Professor Oak-sley.",
      "DSPy is a framework that programs — rather than prompts — language models.",
      "Instead of writing brittle prompts by hand, you define WHAT you want...",
      "...and DSPy figures out HOW to get it done!",
      "Think of it like training Pokemon — you don't micromanage every move.",
      "You set the goal, provide examples, and let the system optimize itself!",
      "Talk to everyone in town to learn the key DSPy concepts. Good luck!"
    ],
    concept: {
      name: 'DSPy Overview',
      description: "Program LMs, don't just prompt them"
    }
  },
  {
    id: 'signatures',
    name: 'Signature Sam',
    position: { x: -3, z: 5 },
    bodyColor: '#3b82f6',
    accentColor: '#1e40af',
    accessory: 'notebook',
    dialogue: [
      "Hey there, trainer! I'm Sam, the Signature specialist!",
      "In DSPy, a Signature declares what goes IN and what comes OUT.",
      "It's like a Pokemon's type card — simple but powerful.",
      "For example: 'question -> answer' is a Signature.",
      "Or try: 'context, question -> answer' for RAG!",
      "You write: class QA(dspy.Signature):",
      "    question = dspy.InputField()",
      "    answer = dspy.OutputField()",
      "No messy prompt templates. Just clean input/output declarations!"
    ],
    concept: {
      name: 'Signatures',
      description: 'Declare inputs and outputs for your LM programs'
    }
  },
  {
    id: 'modules',
    name: 'Module Maya',
    position: { x: 7, z: -1 },
    bodyColor: '#8b5cf6',
    accentColor: '#6d28d9',
    accessory: 'toolbelt',
    dialogue: [
      "Welcome to the Module Shop! I'm Maya!",
      "Modules are like Pokemon moves — they DO the actual work.",
      "dspy.Predict is your basic attack — simple and direct.",
      "Just call: predict = dspy.Predict('question -> answer')",
      "dspy.ChainOfThought is a combo move — it reasons step by step!",
      "It automatically adds a 'reasoning' field before the answer.",
      "And dspy.ReAct? That's your ultimate — it uses tools AND thinks!",
      "Mix and match modules to build powerful LM programs!"
    ],
    concept: {
      name: 'Modules',
      description: 'Building blocks: Predict, ChainOfThought, ReAct'
    }
  },
  {
    id: 'optimizers',
    name: 'Optimizer Ollie',
    position: { x: 2, z: 1 },
    bodyColor: '#ef4444',
    accentColor: '#b91c1c',
    accessory: 'magnifier',
    dialogue: [
      "Yo! I'm Ollie, and I'm ALWAYS optimizing!",
      "DSPy Optimizers are like elite Pokemon trainers...",
      "...they automatically find the BEST prompts and examples!",
      "BootstrapFewShot generates examples that actually work.",
      "It runs your program, keeps the good outputs, and uses them as demos!",
      "MIPROv2 is the champion — it optimizes your ENTIRE prompt.",
      "Instructions, examples, field descriptions — everything!",
      "Just define what 'good' means, and the optimizer handles the rest."
    ],
    concept: {
      name: 'Optimizers',
      description: 'Auto-tune prompts with BootstrapFewShot & MIPROv2'
    }
  },
  {
    id: 'metrics',
    name: 'Metric Mia',
    position: { x: 3, z: 5 },
    bodyColor: '#22c55e',
    accentColor: '#15803d',
    accessory: 'clipboard',
    dialogue: [
      "Hi! I'm Mia, and I measure EVERYTHING!",
      "How do you know if your Pokemon is strong? You measure it!",
      "In DSPy, a metric is just a function that scores outputs.",
      "def my_metric(example, prediction, trace=None):",
      "    return prediction.answer == example.answer",
      "That's it! Return True/False or a score from 0 to 1.",
      "Metrics guide the optimizers — they're your Pokedex!",
      "Better metrics = better optimization = better results!",
      "Pro tip: Start simple, then add more checks as needed."
    ],
    concept: {
      name: 'Metrics',
      description: 'Score your outputs to guide optimization'
    }
  }
];
