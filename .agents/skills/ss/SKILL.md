---
name: ss
description: Simply and summarise the last reply to what matters, in plain words, with a confidence letter on every claim.
argument-hint: "[which reply, or pasted text] (default: your last reply)"
disable-model-invocation: true
---

Rewrite the reply as the answer to the question I asked before it. Keep only
what changes what I do next: the point, decisions, to-dos, suggestions. Drop
the rest; when I want detail, I will ask.

The target is `$ARGUMENTS` when given, else your last reply.

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
