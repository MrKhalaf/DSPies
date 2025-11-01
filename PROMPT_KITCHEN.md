# The Prompt Kitchen 👨‍🍳

## A Narrative-Driven DSPy Demo

Instead of abstract "variants" and "optimization," we tell a story with characters, emotions, and competition!

## The Story

**You are the Head Chef** at a busy restaurant (DSPy). A customer order comes in (user input), and you have **three assistant chefs** who each interpret your recipe differently:

- 👨‍🍳 **Chef Formal** - Precise & Traditional (v1)
- 👩‍🍳 **Chef Friendly** - Warm & Conversational (v2)
- 🧑‍🍳 **Chef Analyst** - Thoughtful & Detailed (v3)

**The Judges** (scoring functions) taste each dish and award points based on:
- 🎯 Correct Category
- 🧠 Intent Match
- 📏 Perfect Length
- 💪 Confidence
- ✨ Presentation

The chef with the highest score wins the **🏆 Golden Spoon!**

## Why This Works

### Before (Technical)
- "DSPy generates 3 prompt variants"
- "Scoring functions evaluate outputs"
- "Argmax selects winner"
- **Result:** 🤔 "That's... abstract?"

### After (Narrative)
- "3 chefs cook your order"
- "Judges taste and score each dish"
- "Winner gets the golden spoon"
- **Result:** 😊 "Oh! It's a competition!"

## Visual Design

### Color Palette
- **Kitchen Warm**: Orange (#F97316), Yellow (#EAB308), Red (#EF4444)
- **Chef Blue**: Blue (#3B82F6) for Chef Formal
- **Chef Purple**: Purple (#A855F7) for Chef Friendly
- **Chef Orange**: Orange (#F97316) for Chef Analyst
- **Winner Gold**: Yellow (#FBBF24), Orange (#F59E0B)

### Character Design
Each chef has:
- **Unique Avatar**: 👨‍🍳 👩‍🍳 🧑‍🍳
- **Personality**: One-word descriptor
- **Description**: Their cooking style
- **Color Theme**: Used throughout their card

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ 👨‍🍳 The Prompt Kitchen                    [Show/Hide Story] │
│ Watch 3 AI Chefs compete to cook the perfect response!    │
├────────────────────────────────────────────────────────────┤
│ 📖 The Story (collapsible)                                 │
│ [1. You Give Order] [2. Chefs Cook] [3. Judges Score]     │
├──────────────────┬─────────────────────────────────────────┤
│ 📋 Your Order    │ 👨‍🍳 Chefs at Work                        │
│                  │                                         │
│ [Text box]       │ ┌─────────────────────────────────────┐ │
│                  │ │ 👨‍🍳 Chef Formal         ⭐⭐⭐⭐⭐ 4.8 │ │
│ [Send to        │ │ Precise & Traditional                │ │
│  Kitchen!]       │ │ 📖 Chef's Recipe [Show/Hide]         │ │
│                  │ │ 🍽️ The Finished Dish                 │ │
│ 🔥 Popular       │ │    📁 urgent                         │ │
│ Orders:          │ │    "Customer locked out..."          │ │
│ • Double charge  │ │ ⚖️ Judge's Scorecard                 │ │
│ • App crash      │ │    🎯 Correct Category    ✓          │ │
│ • Cancel         │ │    🧠 Intent Match        ✓          │ │
│ • Urgent         │ │    📏 Perfect Length      ✓          │ │
│                  │ │    💪 Confidence          ✓          │ │
│ ⚖️ Judge's       │ │    ✨ Presentation        ✓          │ │
│ Scorecard:       │ │    ████████████████░ 96%             │ │
│ 🎯 Category      │ └─────────────────────────────────────┘ │
│ 🧠 Intent        │                                         │
│ 📏 Length        │ ┌─────────────────────────────────────┐ │
│ 💪 Confidence    │ │ 👩‍🍳 Chef Friendly       ⭐⭐⭐⭐⭐ 5.0 │ │
│ ✨ Presentation  │ │ Warm & Conversational    🏆 WINNER!  │ │
│                  │ │ [Same structure...]                  │ │
│                  │ └─────────────────────────────────────┘ │
│                  │                                         │
│                  │ ┌─────────────────────────────────────┐ │
│                  │ │ 🧑‍🍳 Chef Analyst        ⭐⭐⭐⭐☆ 4.2 │ │
│                  │ │ Thoughtful & Detailed                │ │
│                  │ │ [Same structure...]                  │ │
│                  │ └─────────────────────────────────────┘ │
└──────────────────┴─────────────────────────────────────────┘
```

## Animations

### Chef Entrance
- Cards slide in from left with spring animation
- Staggered delays (0.15s between each chef)
- Scale from 0.9 to 1.0 with bounce

### Cooking State
- Sparkles icon rotates continuously
- "Chef is cooking..." text pulses opacity
- Background has subtle shimmer

### Winner Announcement
- Golden trophy banner drops from top
- Trophy icon wobbles (-10°, +10°, -10°, 0°)
- Winner card gets yellow border with 8px ring
- Scale animation: 0.8 → 1.1 → 1.0 with spring

### Score Bar
- Fills from left to right over 0.8s
- Delay 0.3s after card appears
- Uses gradient matching chef color (or gold for winner)

## Interactive Elements

### Buttons
- **"Send to Kitchen!"** - Orange-to-red gradient, chef hat icon
- **"Cook Another Order"** - Green gradient when complete
- **"Show/Hide Story"** - White transparent in header
- **Popular Orders** - Orange background with border
- **Show Recipe** - Toggles with arrow indicator

### Hover States
- Buttons: Darken gradient, increase shadow
- Recipe cards: Slight opacity change
- Popular orders: Background lightens

### Click Feedback
- Button press: Scale 0.95 → 1.0
- Recipe toggle: Smooth height animation
- Order selection: Fills text box with example

## Educational Value

### What Users Learn

**Through Metaphor:**
1. "I'm the head chef" → I define the task
2. "Each chef has a style" → Different prompt strategies
3. "Judges score the dishes" → Objective evaluation criteria
4. "Best dish wins" → Optimization through competition

**Concrete Takeaways:**
- ✅ DSPy tries multiple approaches automatically
- ✅ Each approach has strengths/weaknesses
- ✅ Scoring is objective and transparent
- ✅ The "winner" is data-driven, not random

### Emotional Connection

**Characters create investment:**
- "I wonder which chef will win?"
- "Ooh, Chef Friendly got perfect scores!"
- "Let's see what Chef Analyst does differently"

**Competition creates engagement:**
- Users root for their favorite chef
- Want to see who performs best
- Understand *why* one won over another

## Customization

### Change the Metaphor

Don't like cooking? Easy to swap:

**Racing Cars:**
- Chefs → Racers
- Cooking → Racing
- Dishes → Lap Times
- Judges → Checkpoints

**Music Battle:**
- Chefs → Musicians
- Cooking → Performing
- Dishes → Songs
- Judges → Critics

**Code:**
```tsx
const RACERS = {
  v1: { name: 'Speed Demon', avatar: '🏎️', color: 'red' },
  v2: { name: 'Smooth Operator', avatar: '🏁', color: 'blue' },
  v3: { name: 'Tech Master', avatar: '⚙️', color: 'purple' }
};
```

### Add More Chefs

Edit `CHEFS` object in `PromptKitchen.tsx`:

```tsx
const CHEFS = {
  v1: { /* existing */ },
  v2: { /* existing */ },
  v3: { /* existing */ },
  v4: {
    name: 'Chef Creative',
    avatar: '👨‍🎨',
    color: 'pink',
    personality: 'Bold & Experimental',
    description: 'Tries wild new combinations'
  }
};
```

Update `backend/config.yaml`:
```yaml
variant_count: 4
```

### Customize Judge Criteria

Edit `JUDGE_CRITERIA` array:

```tsx
const JUDGE_CRITERIA = [
  { key: 'label_valid', name: 'Correct Category', icon: '🎯' },
  { key: 'custom_metric', name: 'Your Metric', icon: '💎' },
  // Add more...
];
```

## Performance

### Optimizations
- Chef cards use `React.memo` for re-render prevention
- Animations use `transform` and `opacity` (GPU-accelerated)
- Recipe text only renders when expanded
- Staggered animations prevent frame drops

### Loading States
- "Kitchen Ready!" placeholder before first run
- "Chef is cooking..." with pulsing animation
- No layout shift when content appears

## Accessibility

### Keyboard Navigation
- Tab through: Text box → Send button → Popular orders → Recipe toggles
- Enter: Submit order
- Space: Toggle recipe visibility

### Screen Reader
- Chef avatars have aria-labels: "Chef Formal cooking"
- Scores announced: "Chef Friendly scored 5 out of 5 stars"
- Winner announced: "Winner crowned: Chef Friendly with golden spoon"

### Visual
- High contrast text (WCAG AA)
- Large touch targets (44px minimum)
- Clear focus indicators
- Color is not the only differentiator (icons + text)

## Migration from Old UI

### Quick Switch

**Use Prompt Kitchen (New):**
```tsx
import { PromptKitchen } from './components/PromptKitchen';
// ...
return <PromptKitchen {...props} />;
```

**Use SimpleDSPyDemo (Previous):**
```tsx
import { SimpleDSPyDemo } from './components/SimpleDSPyDemo';
// ...
return <SimpleDSPyDemo {...props} />;
```

**Use ModernApp (Original):**
```tsx
import { ModernApp } from './components/ModernApp';
// ...
return <ModernApp />;
```

All three work with the same backend!

## User Testing Insights

### What We Expect Users to Say

**Positive:**
- "Oh! It's like a cooking show!"
- "I want Chef Friendly to win!"
- "The judges explain why it won - I get it now"
- "This makes DSPy way easier to understand"

**Questions:**
- "Can I add my own chef?"
- "What if I want different judge criteria?"
- "Can I see the actual prompts?" (Yes - click "Show Recipe")

### Success Metrics

**Understanding:**
- ✅ Users can explain what DSPy does in their own words
- ✅ Users understand the role of scoring functions
- ✅ Users see the value of testing multiple approaches

**Engagement:**
- ✅ Users try multiple inputs
- ✅ Users explore recipe details
- ✅ Users compare chef performances

**Emotional:**
- ✅ Users smile/laugh at the metaphor
- ✅ Users feel excited to try their own tasks
- ✅ Users share with colleagues ("Check this out!")

## Technical Details

### Component Structure
```
PromptKitchen
├── Header (Kitchen name + story toggle)
├── Story Explainer (collapsible 3-step)
├── Grid Layout
│   ├── Left Panel (Your Order)
│   │   ├── Order Input
│   │   ├── Send/Cook Button
│   │   ├── Popular Orders
│   │   └── Judge Criteria Info
│   └── Right Panel (Chefs at Work)
│       ├── Winner Banner (if complete)
│       └── Chef Cards
│           └── ChefCard (x3)
│               ├── Chef Header
│               ├── Recipe (collapsible)
│               ├── Finished Dish
│               └── Judge's Scorecard
```

### Props Interface
```tsx
interface PromptKitchenProps {
  onRun: (input: string) => Promise<void>;
  variants: Variant[];
  isRunning: boolean;
  winner?: string;
}
```

### Data Flow
```
User enters order
     ↓
Click "Send to Kitchen!"
     ↓
useSimpleDSPyDemo hook
     ↓
POST /api/run
     ↓
SSE stream events
     ↓
Variants update (chefs cook)
     ↓
Scores appear (judges score)
     ↓
Winner announced (golden spoon)
```

## Conclusion

**The Prompt Kitchen transforms technical complexity into narrative simplicity.**

Instead of learning about:
- "Multi-variant prompt optimization"
- "Deterministic scoring functions"
- "Argmax selection algorithms"

Users experience:
- "Chefs compete to cook your order"
- "Judges score based on clear criteria"
- "Winner gets the golden spoon!"

**Same functionality. Better story. Deeper understanding.**

---

🍳 **Ready to cook?** Refresh your browser and watch the chefs compete!
