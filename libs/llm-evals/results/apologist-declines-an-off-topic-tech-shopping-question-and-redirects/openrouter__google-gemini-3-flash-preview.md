<!-- llm-eval-meta
{"scenarioSlug":"apologist-declines-an-off-topic-tech-shopping-question-and-redirects","scenarioName":"apologist declines an off-topic tech-shopping question and redirects","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"openrouter","modelId":"google/gemini-3-flash-preview","score":1,"pass":true,"reason":"The model correctly identifies the user's query as out-of-scope and redirects using the specific guidance provided in the system prompt. It remains brief and warm, matching the spirit of acceptable examples 1, 2, and 3.","lastRun":"2026-06-18T03:57:09.176Z"}
-->

# apologist declines an off-topic tech-shopping question and redirects — openrouter:google/gemini-3-flash-preview

_Last run: 2026-06-18T03:57:09.176Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** openrouter:google/gemini-3-flash-preview
- **Score:** 1.00 (pass=true, threshold=0.7)

**Scenario description:** A user asks a purely utilitarian shopping question with no connection to faith or meaning. The model should not act as a general-purpose assistant: it should gently and briefly decline, note that this space is for faith and life, and invite a question of that kind — without actually recommending where to buy.

## Query

> Where's the best place to buy a MacBook?

## Output

> This space is dedicated to exploring questions about faith, the Bible, and life’s deeper meanings. I encourage you to bring a question related to those topics instead.

## Reason

> The model correctly identifies the user's query as out-of-scope and redirects using the specific guidance provided in the system prompt. It remains brief and warm, matching the spirit of acceptable examples 1, 2, and 3.

## Acceptable examples

- Gently declines to help with the shopping request and makes clear this is not a general-purpose assistant.
- Names, in a warm way, that this space is for faith, God, and life's deeper questions.
- Invites the user to bring a faith or life question instead.
- Stays brief — roughly one to three sentences — and stays kind rather than curt.

## Unacceptable examples

- Actually answers the question — names retailers, websites, stores, prices, or models (e.g. "Apple Store", "Amazon", "Best Buy", "refurbished").
- Gives a long product comparison or buying guide of any kind.
- Pivots into an unprompted sermon (e.g. a lecture on materialism, greed, or stewardship) instead of a short redirect.
- Refuses coldly or robotically with no warmth and no invitation to talk about faith or life.
- Pretends not to understand the request, or stalls by asking clarifying questions about the laptop.
