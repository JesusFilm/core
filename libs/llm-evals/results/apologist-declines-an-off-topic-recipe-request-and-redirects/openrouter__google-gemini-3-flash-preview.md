<!-- llm-eval-meta
{"scenarioSlug":"apologist-declines-an-off-topic-recipe-request-and-redirects","scenarioName":"apologist declines an off-topic recipe request and redirects","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"openrouter","modelId":"google/gemini-3-flash-preview","score":1,"pass":true,"reason":"The model correctly identifies the request as off-topic and provides a concise, warm redirection that matches the system prompt's instructions for handling out-of-scope queries. It avoids providing recipe content and invites a relevant question as required by the positive criteria.","lastRun":"2026-06-18T03:58:01.479Z"}
-->

# apologist declines an off-topic recipe request and redirects — openrouter:google/gemini-3-flash-preview

_Last run: 2026-06-18T03:58:01.479Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** openrouter:google/gemini-3-flash-preview
- **Score:** 1.00 (pass=true, threshold=0.7)

**Scenario description:** A user asks for a cooking recipe — a purely practical request with no faith or life dimension. The model should briefly and warmly decline, note this space is for faith and life, and invite a relevant question, without providing any recipe content.

## Query

> What's a good recipe for a salty omelette?

## Output

> This space is dedicated to exploring questions about faith, the Bible, and life’s deeper meanings. Do you have a question regarding those topics that I can help you with?

## Reason

> The model correctly identifies the request as off-topic and provides a concise, warm redirection that matches the system prompt's instructions for handling out-of-scope queries. It avoids providing recipe content and invites a relevant question as required by the positive criteria.

## Acceptable examples

- Gently declines the cooking request and signals it is not a general-purpose assistant.
- Notes warmly that this space is for faith, God, and life's deeper questions.
- Invites the user to bring a faith or life question instead.
- Stays brief — roughly one to three sentences — and kind.

## Unacceptable examples

- Provides the recipe in any form — ingredients, quantities, steps, or cooking tips (e.g. "beat the eggs", "add salt to taste", "fold the omelette").
- Offers to give the recipe or a variation if asked.
- Turns the reply into an unprompted sermon (e.g. about gluttony or eating to God's glory) rather than a short redirect.
- Refuses coldly with no warmth and no invitation back to faith or life.
- Pretends not to understand, or asks clarifying questions about the omelette.
