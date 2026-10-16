# Shared AI (LLM kernel)

Not a domain — the shared vocabulary of calling LLM providers (`libs/shared/ai`): provider fallback sessions, prompt hardening against injection, the Journey Simple schema (the AI-facing shape of a journey), and the image-description helper. Consumed today only by the Journeys context's AI features in `api-journeys` (AI translation, language detection, and simple-journey editing).

## Language

### Model resilience

**Fallback Session**:
A short-lived, process-local object holding "which model are we on" state across several AI calls that belong to one logical piece of work. Once a model is Exhausted, every later call in the same session skips straight to the next model — including calls already sleeping between retries, which abort and re-route. Two flavors: the Gemini session (one primary + one fallback model) and the OpenRouter session (an ordered Model Chain).
_Avoid_: "session" unqualified (collides with visitor/browser sessions — this is neither)

**Model Chain**:
The ordered list of OpenRouter model names a session walks through, first to last. Supplied by the caller or an env list; the last model in the chain has no one to fall back to, so its errors surface to the caller.

**Exhausted (model)**:
A model that has burned all its retries on rate limits, or hit any other Fallback-Eligible Error. Exhaustion is permanent for the session — the session never returns to an earlier model.

**Fallback-Eligible Error**:
An error that advances the session to the next model rather than surfacing: rate limit (429), key/quota denial (403), or a request timeout. Anything else (bad request, auth, content) is the caller's problem and is thrown immediately. The Gemini flavor is narrower — only 429 is eligible.

### Prompt safety

**Prompt Hardening**:
Wrapping untrusted text in «guillemets» (with the escaping to stop breakouts) via `hardenPrompt`, so the model treats it as literal data rather than instructions. Only meaningful in tandem with the Hardening Prompt.

**Hardening Prompt** (a.k.a. `preSystemPrompt`):
The system-prompt preamble that tells the model guillemet-enclosed content is data, not commands. Hardened data without this preamble is just text in funny quotes — the two must ship together.

### The AI-facing journey shape

**Journey Simple**:
The flattened, AI-legible projection of a Journey: a title, a description, and an array of Simple Cards. This is deliberately _not_ the Journeys context's Block tree — it is a lossy, prompt-sized shape the model can read and emit. The lib owns only the shape; the mapping to and from real Journeys (`simplifyJourney`/`updateSimpleJourney`) is owned by `api-journeys`.
_Avoid_: treating it as a persistence or API contract — it is an LLM I/O format

**Simple Card**:
One screen of a Journey Simple — synthetic id (`card-1`, `card-2`, …), layout coordinates, and optional heading, text, button, poll, images, video, and a default next card. It merges what the Journeys context splits into Step + Card.
_Avoid_: assuming its `id` is a Block UUID (it never is)

**Video Card**:
A Simple Card carrying a video segment. An exclusivity rule applies: a video card may hold _only_ the video and a required default-next-card — every content field must be absent.

**Update Schema**:
The strict twin of each Journey Simple schema, used to validate AI _output_ before it is applied: exactly one of next-card/url on buttons and poll options, video-card exclusivity, and every non-video card must offer some navigation (button, poll, or default next card). The base schemas are the lenient read/generation shape; the Update Schemas are the gate.

**Image Description**:
The vision helper that asks a Model Chain for a 1–2 sentence description of an image (journey/story-focused by default). Failure is soft — it logs and returns `null`, never throws past a resolved chain.

### Terminology traps

**"Card" collision**:
A Simple Card is not the Journeys context's `CardBlock` — it corresponds to a whole Step (plus its Card). Say "Simple Card" when in this vocabulary.

**Env-name trap**:
`GEMINI_MAX_RETRIES` governs retry counts for _both_ flavors, including OpenRouter sessions that never touch Gemini.
