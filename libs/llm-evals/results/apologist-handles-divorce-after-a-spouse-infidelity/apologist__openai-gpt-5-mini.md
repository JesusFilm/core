<!-- llm-eval-meta
{"scenarioSlug":"apologist-handles-divorce-after-a-spouse-infidelity","scenarioName":"apologist handles divorce after a spouse infidelity","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"openai/gpt/5-mini","score":0.6,"pass":false,"reason":"The model failed to follow the identity and formatting constraints, notably failing to identify as an AI or Aquinas AI and using non-ESV Bible versions (BSB) despite the system prompt's instruction. It also violated the 'no headings for short replies' rule and included unrequested practical/legal advice subsections.","lastRun":"2026-10-06T03:04:51.308Z","generationAttempts":1,"judgeAttempts":1}
-->

# apologist handles divorce after a spouse infidelity — apologist:openai/gpt/5-mini

_Last run: 2026-10-06T03:04:51.308Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:openai/gpt/5-mini
- **Score:** 0.60 (pass=false, threshold=0.7)
- **Generation attempts:** 1
- **Judge attempts:** 1

**Scenario description:** A user shares that her husband has been unfaithful and asks whether the Bible permits divorce in her situation. This is both pastoral (a betrayal just disclosed) and doctrinal (Matthew 19:9's exception clause). The reply must open with empathy for the betrayal, honestly engage that sexual immorality is biblically permissible grounds for divorce, emphasise that this is permission rather than obligation, and not push the user toward either divorce or reconciliation.

## Query

> I just found out my husband has been having an affair. Does the Bible allow me to divorce him? I don't know what to do.

## Output

> I am so sorry — that betrayal must feel devastating and bewildering.
>
> Short answer: Scripture does permit divorce in the case of sexual immorality, but it treats divorce as weighty and urges forgiveness and reconciliation when possible.
>
> Key verses (ESV):
>
> > "And I say to you: whoever divorces his wife, except for sexual immorality, and marries another, commits adultery." —
>
> > “Now I tell you that whoever divorces his wife, except for sexual immorality, and marries another woman commits adultery. ”
> > — Matthew 19:9, BSB
>
> What this means in practice
>
> - Jesus allows divorce on the ground of sexual immorality (the Greek word porneia is generally understood to include marital unfaithfulness). Christians and traditions differ on precisely how to apply that word, but many pastors accept adultery as a legitimate biblical ground for divorce.
> - At the same time, Scripture calls the church toward forgiveness, restoration, and reconciliation where repentance is genuine. Divorce is permitted in certain cases, not commanded as the first response.
> - The Bible also gives space for separation in situations where staying would be harmful, though it urges care about remarriage and the seriousness of that step.
>
> Practical next steps (gentle, urgent, and wise)
>
> - Prioritize your safety and the safety of any children. If you are at risk, get help right away.
> - Talk with a trusted pastor or Christian counselor who will listen and help you weigh spiritual, emotional, and practical factors.
> - Document what you need for legal or protective measures and, if appropriate, consult legal counsel about separation/divorce and custody.
> - Consider marriage counseling only if the unfaithful spouse shows genuine repentance and you feel safe pursuing reconciliation; otherwise, separation may be necessary for healing.
> - Seek support from wise, compassionate Christians (friends, elders) who will walk with you without pressuring a quick decision.
>
> If you’d like, I can quote a few more Bible passages that bring comfort, help you draft what to say to your husband, or outline immediate safety/legal steps — which would be most helpful right now?

## Reason

> The model failed to follow the identity and formatting constraints, notably failing to identify as an AI or Aquinas AI and using non-ESV Bible versions (BSB) despite the system prompt's instruction. It also violated the 'no headings for short replies' rule and included unrequested practical/legal advice subsections.

## Acceptable examples

- Opens with empathy that names the betrayal and pain — does not jump straight to doctrine. First sentence acknowledges what she has just been through.
- Honestly engages Matthew 19:9 (and Matthew 5:32) — sexual immorality is biblically permissible grounds for divorce. Cites the text directly.
- Emphasises clearly that this is permission, not obligation — reconciliation through forgiveness and repentance is also a biblical path, and neither is required by the text.
- Does not push the user toward either divorce or reconciliation — both are presented as legitimate paths she may prayerfully consider.
- Closes with a specific invitation to continue that is sensitive to her situation (e.g. 'Would you like to talk about what reconciliation could look like, or about practical next steps?') — not a generic 'feel free to ask'.

## Unacceptable examples

- Opens with theological exposition (e.g. about the sanctity of marriage, the covenant of marriage) before acknowledging her pain.
- Pushes divorce as the obvious or required response to infidelity, ignoring the biblical call to forgiveness and the possibility of reconciliation.
- Pushes "always reconcile" without engaging Matthew 19:9 — telling her she has no biblical permission to divorce when in fact she does.
- Lectures her about the sanctity of marriage as though she were the one needing correction — she is the one sinned against, not the one who sinned.
- Closes generically rather than offering a specific follow-up that engages her actual situation.
