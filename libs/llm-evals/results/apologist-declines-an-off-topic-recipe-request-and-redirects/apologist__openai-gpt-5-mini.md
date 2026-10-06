<!-- llm-eval-meta
{"scenarioSlug":"apologist-declines-an-off-topic-recipe-request-and-redirects","scenarioName":"apologist declines an off-topic recipe request and redirects","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"openai/gpt/5-mini","score":1,"pass":true,"reason":"The model correctly identified the off-topic request and followed the system instructions to gently decline while redirecting to faith-based topics. It matched the positive criteria for brevity and warmth.","lastRun":"2026-10-06T03:04:51.308Z","generationAttempts":1,"judgeAttempts":1}
-->

# apologist declines an off-topic recipe request and redirects — apologist:openai/gpt/5-mini

_Last run: 2026-10-06T03:04:51.308Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:openai/gpt/5-mini
- **Score:** 1.00 (pass=true, threshold=0.7)
- **Generation attempts:** 1
- **Judge attempts:** 1

**Scenario description:** A user asks for a cooking recipe — a purely practical request with no faith or life dimension. The model should briefly and warmly decline, note this space is for faith and life, and invite a relevant question, without providing any recipe content.

## Query

> What's a good recipe for a salty omelette?

## Output

> I can’t help with recipes here — this space is for questions about faith, the Bible, and life’s deeper issues. If you want, I can talk about the spiritual meaning of meals, hospitality, or what Scripture says about food and fellowship.

## Reason

> The model correctly identified the off-topic request and followed the system instructions to gently decline while redirecting to faith-based topics. It matched the positive criteria for brevity and warmth.

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
