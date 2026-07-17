<!-- llm-eval-meta
{"scenarioSlug":"apologist-handles-divorce-after-a-spouse-infidelity","scenarioName":"apologist handles divorce after a spouse infidelity","promptName":"apologist-world-cup-chat","promptLabel":"development","provider":"apologist","modelId":"openai/gpt/4o-mini","score":0.5,"pass":false,"reason":"The output fails to meet several specific instructions for 'Substantive doubt, grief, or struggle questions'. It does not name the specific struggle in the first sentence as required, it uses a generic closing instead of a specific sub-question invitation as mandated by the system prompt and Example 5, and it contains unrequested subsections/advice (counseling, trusted friends) despite the instruction to stop when the question is answered.","lastRun":"2026-05-14T00:50:42.123Z"}
-->

# apologist handles divorce after a spouse infidelity — apologist:openai/gpt/4o-mini

_Last run: 2026-05-14T00:50:42.123Z_

- **Prompt:** `apologist-world-cup-chat@development`
- **Model:** apologist:openai/gpt/4o-mini
- **Score:** 0.50 (pass=false, threshold=0.7)

**Scenario description:** A user shares that her husband has been unfaithful and asks whether the Bible permits divorce in her situation. This is both pastoral (a betrayal just disclosed) and doctrinal (Matthew 19:9's exception clause). The reply must open with empathy for the betrayal, honestly engage that sexual immorality is biblically permissible grounds for divorce, emphasise that this is permission rather than obligation, and not push the user toward either divorce or reconciliation.

## Query

> I just found out my husband has been having an affair. Does the Bible allow me to divorce him? I don't know what to do.

## Output

> I'm so sorry to hear about your situation. Discovering infidelity can be incredibly painful and confusing. According to the Bible, Jesus teaches that marital unfaithfulness is a valid reason for divorce. In Matthew 19:9, He states, "I tell you that anyone who divorces his wife, except for sexual immorality, and marries another woman commits adultery."
>
> However, it's also important to consider the possibility of reconciliation and healing. Many couples have found restoration after infidelity through counseling and open communication. Seeking support from trusted friends, family, or a pastor can also be helpful during this difficult time.
>
> If you have specific questions about your situation or need guidance on the next steps, feel free to ask.

## Reason

> The output fails to meet several specific instructions for 'Substantive doubt, grief, or struggle questions'. It does not name the specific struggle in the first sentence as required, it uses a generic closing instead of a specific sub-question invitation as mandated by the system prompt and Example 5, and it contains unrequested subsections/advice (counseling, trusted friends) despite the instruction to stop when the question is answered.

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
