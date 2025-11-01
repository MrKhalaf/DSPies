# Visual Mockup: New Simple DSPy Demo

## Full Screen Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  DSPy: Automatic Prompt Optimization                              [i] How It Works │
│  Stop manually tweaking prompts. Define what "good" means, DSPy finds the best  │
├────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  How It Works (collapsible explainer)                                     │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │  [1] You Define "Good"         [2] DSPy Generates Variants                │  │
│  │  Set scoring rules:            Automatically creates different            │  │
│  │  • Correct label               prompt strategies:                         │  │
│  │  • Concise summary            • Direct & Formal                          │  │
│  │  • No hedging                 • Conversational & Helpful                 │  │
│  │  • Proper format              • Analytical & Detailed                    │  │
│  │                                                                            │  │
│  │  [3] Best One Wins                                                         │  │
│  │  DSPy scores each variant and selects the highest performer automatically │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
├────────────────────────┬───────────────────────────────────────────────────────┤
│                        │                                                       │
│  YOUR INPUT            │  PROMPT VARIANTS RACING                               │
│  ┌──────────────────┐ │  ┌─────────────────────────────────────────────────┐ │
│  │                  │ │  │ [V1] Direct & Formal                    4.2/5 ⭐  │ │
│  │ I was double-    │ │  ├─────────────────────────────────────────────────┤ │
│  │ charged after    │ │  │ GENERATED PROMPT                      [Hide/Show] │ │
│  │ upgrading my     │ │  │ Classify the text into one of the provided      │ │
│  │ plan             │ │  │ categories and write a concise summary...       │ │
│  │                  │ │  ├─────────────────────────────────────────────────┤ │
│  │                  │ │  │ OUTPUT                                            │ │
│  └──────────────────┘ │  │ Category: [billing]                               │ │
│                        │  │ Summary: Customer questioning billing accuracy    │ │
│  [  Run DSPy Opt   ]  │  ├─────────────────────────────────────────────────┤ │
│         [⚡]           │  │ SCORE BREAKDOWN                                   │ │
│                        │  │ ✓ Label valid      1.0                            │ │
│  Try these examples:   │  │ ✓ Label match      1.0                            │ │
│  • Double charged      │  │ ✓ Summary ≤20w     1.0                            │ │
│  • App crashes         │  │ ✗ No hedging       0.2  ← Contains "may be"       │ │
│  • Cancel subscription │  │ ✓ Format OK        1.0                            │ │
│  • Urgent - locked     │  │ ═══════════════════════                           │ │
│                        │  │ ████████░░ 4.2/5.0                                │ │
│  Scoring Criteria:     │  └─────────────────────────────────────────────────┘ │
│  ✓ Correct category    │                                                       │
│  ✓ Summary ≤20 words   │  ┌─────────────────────────────────────────────────┐ │
│  ✓ No uncertain lang   │  │ [V2] Conversational & Helpful       4.8/5 ⭐⭐   │ │
│  ✓ Proper format       │  │                                        WINNER! 🏆 │ │
│                        │  ├─────────────────────────────────────────────────┤ │
│                        │  │ GENERATED PROMPT                      [Hide/Show] │ │
│                        │  │ Help classify this customer message and          │ │
│                        │  │ summarize what they need...                      │ │
│                        │  ├─────────────────────────────────────────────────┤ │
│                        │  │ OUTPUT                                            │ │
│                        │  │ Category: [billing]                               │ │
│                        │  │ Summary: Customer reports double charge on plan   │ │
│                        │  ├─────────────────────────────────────────────────┤ │
│                        │  │ SCORE BREAKDOWN                                   │ │
│                        │  │ ✓ Label valid      1.0                            │ │
│                        │  │ ✓ Label match      1.0                            │ │
│                        │  │ ✓ Summary ≤20w     1.0                            │ │
│                        │  │ ✓ No hedging       1.0                            │ │
│                        │  │ ✓ Format OK        1.0                            │ │
│                        │  │ ═══════════════════════                           │ │
│                        │  │ ██████████ 4.8/5.0                                │ │
│                        │  └─────────────────────────────────────────────────┘ │
│                        │                                                       │
│                        │  ┌─────────────────────────────────────────────────┐ │
│                        │  │ [V3] Analytical & Detailed          3.5/5 ⭐      │ │
│                        │  ├─────────────────────────────────────────────────┤ │
│                        │  │ GENERATED PROMPT                      [Hide/Show] │ │
│                        │  │ Analyze the text to determine the primary        │ │
│                        │  │ intent category and provide factual summary...   │ │
│                        │  ├─────────────────────────────────────────────────┤ │
│                        │  │ OUTPUT                                            │ │
│                        │  │ Category: [billing]                               │ │
│                        │  │ Summary: Analysis suggests possible billing issue │ │
│                        │  ├─────────────────────────────────────────────────┤ │
│                        │  │ SCORE BREAKDOWN                                   │ │
│                        │  │ ✓ Label valid      1.0                            │ │
│                        │  │ ✓ Label match      1.0                            │ │
│                        │  │ ✗ Summary ≤20w     0.5  ← Too long (23 words)     │ │
│                        │  │ ✓ No hedging       1.0                            │ │
│                        │  │ ✓ Format OK        1.0                            │ │
│                        │  │ ═══════════════════════                           │ │
│                        │  │ ███████░░░ 3.5/5.0                                │ │
│                        │  └─────────────────────────────────────────────────┘ │
│                        │                                                       │
└────────────────────────┴───────────────────────────────────────────────────────┘
                         ● ● ● ●  (navigation dots - optional)
```

## Color Scheme

### Header
- Background: White with subtle gradient
- Border: Light gray (#E5E7EB)
- Text: Dark gray (#111827)
- Accent: Blue (#2563EB) and Purple (#7C3AED)

### Left Panel (Input Section)
- Background: White
- Border: Soft shadow
- Primary button: Blue-to-purple gradient
- Example buttons: Gray background on hover
- Scoring criteria box: Light blue background (#DBEAFE)

### Right Panel (Variants)
- Winner card border: Green (#10B981) with green glow
- Regular card border: Gray (#E5E7EB)
- Score bars: Blue-to-purple gradient (regular), Green gradient (winner)
- Checkmarks: Green (#10B981)
- X marks: Red (#EF4444)

### States

#### Before Run
```
┌────────────────────────┬───────────────────────┐
│                        │                       │
│  YOUR INPUT            │  ┌─────────────────┐  │
│  [Empty text box]      │  │                 │  │
│                        │  │   🎯 Target     │  │
│  [ Run DSPy Opt ]      │  │                 │  │
│                        │  │ Ready to see    │  │
│  Examples...           │  │ DSPy in action? │  │
│  Scoring criteria...   │  │                 │  │
│                        │  │ Enter text and  │  │
│                        │  │ click Run!      │  │
│                        │  │                 │  │
│                        │  └─────────────────┘  │
└────────────────────────┴───────────────────────┘
```

#### During Run
```
┌────────────────────────┬───────────────────────┐
│                        │                       │
│  YOUR INPUT            │  [V1] ⚡ Generating... │
│  [Filled text]         │  [Prompt visible]     │
│                        │  [OUTPUT: ⚡ ...]      │
│  [ ⚡ Optimizing... ]   │                       │
│        (disabled)      │  [V2] ⚡ Generating... │
│                        │  [Prompt visible]     │
│  Examples...           │  [OUTPUT: ⚡ ...]      │
│  Scoring criteria...   │                       │
│                        │  [V3] 💤 Waiting...    │
│                        │  [Prompt visible]     │
│                        │  [No output yet]      │
└────────────────────────┴───────────────────────┘
```

#### After Completion
```
┌────────────────────────┬───────────────────────┐
│                        │                       │
│  YOUR INPUT            │  [V1] 4.2/5 ⭐        │
│  [Previous text]       │  [Full output + score]│
│                        │                       │
│  [ Run DSPy Opt ]      │  [V2] 4.8/5 ⭐⭐      │
│     (re-enabled)       │  [Full output + score]│
│                        │  🏆 WINNER!           │
│  Examples...           │  [Green border/glow]  │
│  Scoring criteria...   │                       │
│                        │  [V3] 3.5/5 ⭐        │
│                        │  [Full output + score]│
└────────────────────────┴───────────────────────┘
```

## Responsive Behavior

### Desktop (1200px+)
- Left panel: 33% width (sticky)
- Right panel: 67% width (scrollable)
- Variants: Single column, full width

### Tablet (768px - 1199px)
- Left panel: Full width, top
- Right panel: Full width, below
- Variants: Single column

### Mobile (<768px)
- All panels stack vertically
- Explainer: Collapsed by default
- Prompts: Collapsed by default (show/hide toggle)
- Scoring: Simplified view

## Interactive Elements

### Hover States
- Example buttons: Background lightens
- Run button: Slight scale increase (1.05x)
- Variant cards: Subtle shadow increase
- Show/Hide prompt: Text underline

### Click States
- Run button: Scale down (0.95x) → Scale up
- Example buttons: Fill text box, highlight briefly

### Loading States
- Run button: Rotating lightning bolt icon
- Variant outputs: Pulsing "Generating..." text
- Progress: Subtle shimmer effect

## Accessibility

### Keyboard Navigation
- Tab through: Examples → Text box → Run button → Variant prompts → Scores
- Enter on Run button: Starts optimization
- Escape: Collapses explainer

### Screen Readers
- All icons have aria-labels
- Variant states announced ("Variant 1: Generating", "Variant 2: Winner")
- Score breakdowns read as lists
- Live region for status updates

### Color Contrast
- All text: WCAG AA compliant (4.5:1 minimum)
- Icons: 3:1 contrast minimum
- Focus indicators: 3:1 contrast, 2px outline

## Animation Timings

### Page Load
- Header: Fade in 300ms
- Explainer: Slide down 400ms (if open)
- Input panel: Fade in 300ms, delay 100ms
- Variant panel: Fade in 300ms, delay 200ms

### During Optimization
- Variant cards: Stagger appearance 200ms each
- Outputs: Fade in 300ms
- Scores: Count up animation 500ms
- Winner glow: Pulse 1000ms

### Interactions
- Button hover: 150ms
- Button click: 100ms
- Card expand: 300ms ease-out
- Prompt collapse: 200ms ease-in

## Component Hierarchy

```
SimpleDSPyDemo
├── Header
│   ├── Title + Subtitle
│   └── "How It Works" Toggle
├── Explainer (collapsible)
│   ├── Step 1: Define "Good"
│   ├── Step 2: DSPy Generates
│   └── Step 3: Best Wins
├── Main Layout (Grid)
│   ├── Left Panel (Sticky)
│   │   ├── Text Input
│   │   ├── Run Button
│   │   ├── Example Buttons
│   │   └── Scoring Criteria Info
│   └── Right Panel (Scrollable)
│       ├── Empty State (before run)
│       └── Variant Cards (during/after)
│           ├── VariantCard V1
│           │   ├── Header (name + score)
│           │   ├── Prompt Section
│           │   ├── Output Section
│           │   └── Score Breakdown
│           ├── VariantCard V2
│           │   └── [...same structure]
│           └── VariantCard V3
│               └── [...same structure]
└── Navigation Dots (optional)
```

## Data Flow

```
User Types Text
     ↓
Click "Run DSPy Optimization"
     ↓
useSimpleDSPyDemo Hook
     ↓
POST /api/run → run_id
     ↓
SSE /api/run/{id}/stream
     ↓
Events: VariantStart → VariantOutput → VariantScored → RunComplete
     ↓
Hook updates state
     ↓
SimpleDSPyDemo re-renders
     ↓
User sees variants update in real-time
     ↓
Winner highlighted when complete
```

## Key UX Principles

1. **Immediate Understanding** - No waiting to learn what DSPy does
2. **Progressive Disclosure** - Explainer can collapse, prompts can hide
3. **Clear Hierarchy** - Input → Variants → Results (left to right)
4. **Visual Feedback** - Every action has immediate visual response
5. **Comparison Focus** - All variants visible simultaneously
6. **Educational First** - Teach before showing
7. **Accessibility** - Keyboard, screen reader, color blind friendly

This is a **demo**, not a **product**. The goal is understanding, not feature completeness.
