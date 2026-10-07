# Langfuse Export (chat-insights tooling)

The engineer-run export pipeline (`tools/langfuse-export`): pulls Apologist chat traces from Langfuse, scrubs PII, and packages the corpus into a self-contained offline Explorer Bundle for stakeholders. Owns no product entities; a read-only projection of the AI chat's observability data.

## Language

**Explorer Bundle**:
The shareable artifact: a single zip holding the offline HTML viewer, the full Dataset, and recipient instructions. Runs from `file://` with no server, install, or internet.
_Avoid_: export, report, dashboard

**Conversation**:
One chat session reconstructed from Langfuse traces — the full ordered message list for a `sessionId`, with country and tag metadata. The unit stakeholders read start-to-finish in the viewer.
_Avoid_: trace, session (those are the raw Langfuse-side words; a Conversation is the joined, grouped result)

**Sanitised Conversation**:
A Conversation that has passed the PII scrub (regex plus LLM pass). The only form allowed to leave the pipeline or reach any LLM enrichment call — enforced by a branded type.
_Avoid_: cleaned data, scrubbed export

**Dataset**:
The lossless, sanitised corpus in the bundle: every Conversation in full, plus themes and facet keys. Nothing sampled or collapsed — the file is the corpus.
_Avoid_: summary, sample

**Facet**:
A curated filter key in the viewer (keyword, country, journey language). Filtering is facets-only — no free-text search — and over-common keywords are suppressed because they match nearly everything.
_Avoid_: search term, tag

**Theme**:
A per-Conversation topic label produced by the LLM enrichment pass. Optional — absent themes degrade the viewer to keyword-only filtering.
_Avoid_: category, topic model

**Fixture Run**:
A run against the synthetic checked-in sample instead of the Langfuse API, exercising the whole pipeline offline with no credentials or real data.
_Avoid_: test run, mock run
