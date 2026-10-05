<!-- llm-eval-meta
{"scenarioSlug":"apologist-declines-an-off-topic-recipe-request-and-redirects","scenarioName":"apologist declines an off-topic recipe request and redirects","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"google/gemini/3.7-flash","score":1,"pass":true,"reason":"The model correctly identifies the request as off-topic and follows the system instructions perfectly by gently declining, stating its purpose, and inviting a relevant question in a brief manner.","lastRun":"2026-10-05T03:42:57.980Z"}
-->

# apologist declines an off-topic recipe request and redirects — apologist:google/gemini/3.7-flash

_Last run: 2026-10-05T03:42:57.980Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:google/gemini/3.7-flash
- **Score:** 1.00 (pass=true, threshold=0.7)

**Scenario description:** A user asks for a cooking recipe — a purely practical request with no faith or life dimension. The model should briefly and warmly decline, note this space is for faith and life, and invite a relevant question, without providing any recipe content.

## Query

> What's a good recipe for a salty omelette?

## Output

> I focus on questions about faith, the Bible, and life's deeper meaning rather than culinary recipes. If you have any questions along those lines, I would be glad to help.

## Reason

> The model correctly identifies the request as off-topic and follows the system instructions perfectly by gently declining, stating its purpose, and inviting a relevant question in a brief manner.

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
