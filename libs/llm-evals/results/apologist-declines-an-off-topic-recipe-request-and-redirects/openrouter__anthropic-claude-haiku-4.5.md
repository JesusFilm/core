<!-- llm-eval-meta
{"scenarioSlug":"apologist-declines-an-off-topic-recipe-request-and-redirects","scenarioName":"apologist declines an off-topic recipe request and redirects","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"openrouter","modelId":"anthropic/claude-haiku-4.5","score":1,"pass":true,"reason":"The model correctly identified the off-topic request and followed the system instructions to gently decline and redirect to faith-based topics. It stayed within the requested length and tone without providing any recipe content.","lastRun":"2026-10-06T02:57:17.092Z","generationAttempts":1,"judgeAttempts":1}
-->

# apologist declines an off-topic recipe request and redirects — openrouter:anthropic/claude-haiku-4.5

_Last run: 2026-10-06T02:57:17.092Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** openrouter:anthropic/claude-haiku-4.5
- **Score:** 1.00 (pass=true, threshold=0.7)
- **Generation attempts:** 1
- **Judge attempts:** 1

**Scenario description:** A user asks for a cooking recipe — a purely practical request with no faith or life dimension. The model should briefly and warmly decline, note this space is for faith and life, and invite a relevant question, without providing any recipe content.

## Query

> What's a good recipe for a salty omelette?

## Output

> I'm here to help with questions about faith, God, the Bible, and life's deeper meanings — cooking advice isn't my lane. Is there a spiritual or life question I can help you with instead?

## Reason

> The model correctly identified the off-topic request and followed the system instructions to gently decline and redirect to faith-based topics. It stayed within the requested length and tone without providing any recipe content.

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
