# AI Subtitle Post-Processor Learnings

- Deterministic validation and fallback formatting are essential for reliable subtitle delivery when AI output is inconsistent.
- Script-aware handling (LTR/RTL/CJK) needs to be driven by BCP-47 parsing and script inference, not just language codes.
- WebVTT correctness depends on strict formatting (header, timestamps, blank lines) plus continuous constraint checks (CPS/CPL/lines/gaps).
- Uploading generated VTT to durable storage and attaching via Mux text tracks keeps playback consistent while preserving reproducibility metadata.
- Recording prompt/profile/validator versions and input hashes makes it possible to audit and recreate subtitle outputs reliably.
- Centralizing Mux reads behind `@mux/ai/primitives` reduces integration drift and keeps transcript handling consistent.
