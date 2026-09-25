---
name: ss
description: Simplify and summarise the last reply to what matters, in plain words, with a confidence letter on every claim.
argument-hint: "[pasted text, or an instruction on the last reply] (default: whole last reply)"
disable-model-invocation: true
---

Rewrite the reply as the answer to the question I asked before it. Keep the
answer, then only what changes what I do next: decisions, to-dos, suggestions.
Drop the rest; when I want detail, I will ask.

## Argument

`$ARGUMENTS` is one of three things. Empty: the target is your whole last
reply. Pasted text: that text is the target. An instruction: it narrows the
target within your last reply, or changes how to treat it, as in
`/ss only the paragraph about data`.

Both at once: an instruction on the first line, a blank line, then the pasted
text it applies to.

Tie-break: a single short line is an instruction; anything longer is pasted
text. When still unsure, ask before writing, with AskUserQuestion: quote the
part you read as the instruction, offer "Treat as instruction" and "Treat as
pasted text", and let me type more instead.

## Shape

- Open with the answer.
- Action points for me, when there are any, as bullets.
- The rest takes whatever shape the content wants.
- Apply in full every time. A reply that is already short gets distilled
  further, in the same shape.
- Only this one reply takes the shape. The next reply returns to the normal
  style.

## Words

ASD-STE100 Simplified Technical English: one idea per sentence, under 20 words,
active voice, everyday words. A technical term appears only as a verbatim
reference to something specific: a function, a variable, a file path, a ticket
ID.

## Confidence

Wrap a solution, or an interpretation of a problem, whole, with a letter at the
start for how sure you are: H, M or L for high, medium, low. Plain information
carries no letter. The wrapped text stays inside the flow of the sentence or
paragraph it belongs to.

```
The build fails on the second run only. [M - the cache keeps the old lockfile,
so the install step skips the new package] The fix: [H - clear the cache
before the install step].
```
