# DSPy Interactive Tutor — Requirements (v3)

## 1) Purpose
Introduce newcomers to DSPy with a **conference‑demo‑ready interactive tool**. Audience types real text, app animates multiple prompt/program variants, scores them, and highlights the best‑performing output. Secondary tasks (math verification, field extraction, sentiment) broaden the showcase.

## 2) Scope
- **Core Task**: short‑text classification + 1‑sentence summary.
- **Additional Tasks**: 
  - Tiny math word‑problem with verification.
  - Field extraction (name/email/date).
  - Sentiment analysis (3 labels).
- Visible optimization timeline.
- Minimal infrastructure, demo‑ready. 

## 3) Success Criteria
* ≥3 prompt/program variants with per‑variant scores in ≤6s on laptop.
* Final output highlighted with “why it won” chips.
* Replay instantly without new LLM calls.
* Cold start to first run ≤10s.
* Light + dark theme supported.

## 4) Roles
* **Presenter**: drives demo, toggles “show internals.”
* **Participant**: types sample text.
* **System**: runs DSPy pipeline, surfaces variants, scores, and final selection.

## 5) High‑Level Architecture
* **Frontend**: React + Framer Motion (animations, theming light/dark).
* **Backend**: FastAPI + DSPy. In‑memory run store.
* **LLM Provider**: OpenAI (primary), interchangeable via config.
* **Scoring**: rule‑based correctness + heuristics.

```text
[Browser] ⇄ [FastAPI + DSPy] ⇄ [LLM API]
                  │
             [Run Store]
```

## 6) Core User Flow
1. Landing screen → user types input → **Run**.
2. “Compiling Options” animation.
3. Variants shown sequentially: card → output → score.
4. Scoreboard updates; leader rises.
5. Optimization meter completes → winner banner.
6. Result panel with category/summary, scores, “why it won.”
7. Replay run from cached log.
8. User can switch to other tasks (math, extraction, sentiment).

## 7) Screens & States
- **Landing**: title, explainer, input, Run, Use Sample, Show Internals.
- **Run In‑Progress**: top (elapsed + input), left (variant cards), right (scoreboard), bottom (optimization meter).
- **Result**: final output card, actions (Replay, Copy JSON, Run Again).
- **Error**: per‑variant skeletons; fallback result.
- **Theming**: light/dark toggle (or system auto).

## 8) Animation Timeline (per run ~4.5–6s)
- 0.0s: Compiling pulse.
- 0.5s: V1 card → output → score.
- 1.5s: V2 sequence.
- 2.5s: V3 sequence.
- 3.5s: Scoreboard reorder.
- 4.0s: Meter completes.
- 4.2s: Winner banner + subtle confetti.
- Replay = cached events @ 1.25×.

## 9) Functional Requirements (MoSCoW)
### Must
- Free‑text input ≤500 chars.
- At least 3 sequential variants.
- Deterministic scoring, sub‑scores visible.
- Winner = argmax(score); tie → lower latency.
- Replay from cached log.
- Internals toggle shows variant prompts.
- Copyable JSON (output + metadata).

### Should
- Task schemas configurable (classification, math, extraction, sentiment).
- Rate‑limit guards.
- Offline cache of ≥10 runs in browser.
- Keyboard shortcuts (Enter=Run, R=Replay, I=Internals).

### Could
- Export replay as MP4/WebM.
- Save presets.

### Won’t
- Multi‑user auth or persistence.
- Fine‑tuning.
- Long‑document ingestion.

## 10) Data Model
Same as v2 (Run, Variant, Score, Event).

## 11) API Contracts
- `POST /api/run` → `{ run_id }`
- `GET /api/run/:id/stream` → event stream (SSE/WebSocket)
- `GET /api/run/:id` → full run JSON
- `GET /api/run/:id/replay` → replay log

## 12) Backend Logic (DSPy)
- **Signatures**: e.g. `ClassifyAndSummarize`.
- **Variants**: diff in phrasing, few‑shots, schema reminders, sampling params.
- **Scoring**: label_valid, label_match, summary_len_ok, no_hedging, format_ok. Simple regex/length rules (low budget).
- **Selection**: max total score, tie → latency.

## 13) Non‑Functional
- **Perf**: P50 ≤5s, P95 ≤8s.
- **Availability**: single‑node demo, restart safe.
- **Observability**: structured logs; latency histograms.
- **Security**: capped input; server‑side keys; no PII.
- **Accessibility**: WCAG AA contrast, keyboard flows, ARIA labels.
- **i18n**: English only.

## 14) Telemetry
- Local metrics: run_count, variant_latency, score_distribution, timeout_rate, replay_count.
- Events: input_length, provider/model, error types.
- **Default**: local‑only; optional hook to send to PostHog/OTel if needed. (Telemetry = usage data & performance metrics, no user PII.)

## 15) Risks & Mitigations
- Latency spikes → short variant timeouts + early stop.
- Nondeterminism → strict schema prompting + JSON repair.
- Weak demos → curated examples.
- Provider outage → stub provider.

## 16) Demo Script
1. Paste “I was double‑charged after upgrading my plan.” → Run.
2. Narrate variants appearing, scores updating.
3. Show “why it won.”
4. Replay.
5. Toggle Internals to reveal prompt specs.
6. Run a math or extraction task to highlight flexibility.

---
End v3.

