---
title: Previewing and triggering api-users React-email templates locally
date: 2026-06-02
category: docs/solutions/developer-experience/
module: api-users
problem_type: developer_experience
component: email_processing
severity: medium
related_components:
  - background_job
  - testing_framework
  - development_workflow
applies_when:
  - "Rendering a react-email template standalone (outside the app) with tsx"
  - "Triggering a verification-email send locally without the Redis/BullMQ worker running"
  - "Writing a throwaway script that imports from apis/api-users/src/schema/user or workers/email"
  - "Running api-users vitest specs directly from the command line"
symptoms:
  - "SyntaxError: The requested module ... does not provide an export named '<Component>' when importing a template from a .mts/ESM script"
  - "Throwaway script never exits — runs to timeout, SIGTERM (exit 143) — even though the email already sent"
  - "Failed to load url /workspaces/core/test/prismaMock.ts (0 tests) when running api-users vitest from the repo root"
tags:
  - react-email
  - bullmq
  - ioredis
  - tsx
  - maildev
  - vitest
  - email-preview
  - devcontainer
---

# Previewing and triggering api-users React-email templates locally

## Context

The `api-users` email templates (e.g. `EmailVerifyJesusFilmOne`) are react-email
components rendered to HTML/plain-text by a BullMQ worker and sent over SMTP.
There is no built-in local preview server, and the production send path runs
through Redis. Two common local tasks — (1) rendering a template to HTML to eyeball
it in a browser, and (2) triggering a real send to confirm the end-to-end output —
each hit non-obvious gotchas in this Nx monorepo + devcontainer. The sharpest one is
a **silent process hang where the email sends successfully but the script never
exits**, which reads like a failure when it was a success.

This was learned while redesigning the JesusFilmOne verification email. All snippets
below were run and verified in the devcontainer.

## Guidance

### A. Render a template to HTML (use a `.cts` script, not ESM)

Importing the tsx-transpiled template from an **ESM** script (`.mts`, or `.ts` with
`"module": "esnext"`) fails:

```
SyntaxError: The requested module '.../EmailVerifyJesusFilmOne' does not provide an export named 'EmailVerifyJesusFilmOne'
```

Node's `cjs-module-lexer` can't detect the named export from the transpiled CJS shape
(`export const X = …; X.PreviewProps = …; export default X`). Writing the script as
**`.cts` and using `require()`** sidesteps ESM static named-export analysis entirely.

You also need a tsconfig that (a) supplies the `@core/*` path aliases (e.g.
`@core/yoga/* -> libs/yoga/src/*`) and (b) sets `jsx: "react-jsx"` — `tsconfig.base.json`
sets **no** `jsx`, and the templates use JSX without importing React, so the automatic
runtime is required.

`tmp-email-tsconfig.json` (repo root):

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

Only `jsx` is load-bearing here: `tsx` ignores `module`/`moduleResolution` from the
tsconfig, and `extends` is what supplies the `@core/*` path aliases.

`tmp-email-preview.cts` (repo root) — `require` the explicit component **file**
(not the directory `index`), call the component as a function with its `PreviewProps`,
and serve on `0.0.0.0` so the devcontainer forwards the port:

```ts
const { createServer } = require('node:http')
const { render } = require('@react-email/render')
const {
  EmailVerifyJesusFilmOne
} = require('./apis/api-users/src/emails/templates/EmailVerifyJesusFilmOne/EmailVerifyJesusFilmOne')

async function main() {
  const html = await render(EmailVerifyJesusFilmOne(EmailVerifyJesusFilmOne.PreviewProps))
  createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  }).listen(4321, '0.0.0.0', () => console.log('http://localhost:4321'))
}
main().catch((e) => { console.error(e); process.exit(1) })
```

```bash
npx tsx --tsconfig ./tmp-email-tsconfig.json ./tmp-email-preview.cts
# open http://localhost:4321 — stop the server with Ctrl-C when done
```

`render()` from `@react-email/render` is **async** (returns `Promise<string>`). The
preview server stays up by design — that Ctrl-C is expected, and is **not** the
involuntary hang described in section C.

### B. Trigger a real send without Redis — call the worker's `service()` directly

The production trigger is the `createVerificationRequest(input: { app: JesusFilmOne })`
GraphQL mutation -> `verifyUser()` -> BullMQ `verifyUser` queue -> worker `service()`
-> render + `sendEmail`. When the `redis` container is down (host `redis` resolves to
`ENOTFOUND`), bypass the queue by calling the worker's `service()` directly with a
hand-built job. Two requirements:

1. `service()` early-returns when `prisma.user.findUnique({ where: { userId } })` is
   `null`, so **upsert a throwaway `User` row first** (the `users` schema requires
   `userId` + `firstName`; `email` is unique).
2. Load the api-users env — the Prisma client reads `PG_DATABASE_URL_USERS`, and
   `sendEmail` throws unless `SMTP_URL` is set. `apis/api-users/.env` provides both
   (`SMTP_URL=smtp://maildev:1025`).

`tmp-email-trigger.cts` (repo root) — **inline the 6-digit token; do NOT import it
from `verifyUser.ts`** (see section C):

```ts
const crypto = require('node:crypto')
const { prisma } = require('@core/prisma/users/client')
const { service } = require('./apis/api-users/src/workers/email/service/service')

const EMAIL = 'someone@example.test'
const USER_ID = 'local-test-jesusfilmone'

async function main() {
  await prisma.user.upsert({
    where: { email: EMAIL },
    update: {},
    create: { userId: USER_ID, firstName: 'Test', email: EMAIL, emailVerified: false }
  })

  const token = crypto.randomInt(100000, 999999).toString() // inlined on purpose

  await service({
    name: 'verifyUser',
    data: { userId: USER_ID, email: EMAIL, token, redirect: undefined, app: 'JesusFilmOne' }
  })

  console.log(`sent token ${token} — check http://localhost:1080`)
  await prisma.user.delete({ where: { userId: USER_ID } }) // email is unique; clean up
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
```

```bash
set -a && . apis/api-users/.env && set +a
npx tsx --tsconfig ./tmp-email-tsconfig.json ./tmp-email-trigger.cts
```

The `{ name, data }` object is a deliberate runtime duck-type — `service()` only reads
`job.data`. It would not satisfy BullMQ's `Job<VerifyUserJob>` under `tsc` (the spec
casts `as unknown as Job<…>`); `tsx` runs the `.cts` script without full type-checking.

The mail lands in **MailDev** (UI `http://localhost:1080`, SMTP `maildev:1025`).
MailDev **captures** mail; it does **not** deliver externally — repoint `SMTP_URL`
at a real relay for real delivery. **Delete the throwaway `User` row** afterward: a
leftover row holding a real email would block that person's genuine signup via the
unique constraint.

### C. The BullMQ/ioredis import-side-effect hang (read before writing any local script)

`apis/api-users/src/schema/user/verifyUser.ts` (where `generateSixDigitNumber` lives)
also does `import { queue } from '../../workers/email/queue'`, and `queue.ts` runs
`new Queue(queueName, { connection })` **at module load**. Constructing a BullMQ Queue
opens an **ioredis** connection to the `redis` host (`connection` defaults to
`{ host: 'redis', port: 6379 }`). When Redis is unreachable, that connection **keeps
the Node event loop alive**, so a short-lived script **never exits** — it runs to its
`timeout` and dies with SIGTERM (exit 143) **even though `service()` finished and the
email already sent**.

The failure is misleading: MailDev shows the delivered mail, but the terminal shows a
killed process, so you conclude the send failed when it succeeded.

Fix: never import from a module that transitively constructs the Queue. Inline the pure
helper instead (`crypto.randomInt(100000, 999999).toString()`). After inlining, the
script exits cleanly (`exit 0`).

General rule: any throwaway script that imports from `verifyUser.ts` (or anything else
pulling `workers/email/queue` / `workers/server`) will hang on exit when Redis is down.
Audit the import chain, or stand up Redis if you genuinely want the queue path.

### D. api-users vitest specs must be run from the project directory, not the repo root

```bash
# from /workspaces/core — FAILS to load setup (0 tests):
npx vitest run --config apis/api-users/vitest.config.mts 'apis/api-users/src/.../foo.spec.ts'
#   Failed to load url /workspaces/core/test/prismaMock.ts
```

`vitest.config.mts` has `setupFiles: ['./test/prismaMock.ts']`, which resolves
**relative to the shell CWD**. From the repo root that points at the non-existent
`/workspaces/core/test/prismaMock.ts`; the real mock is `apis/api-users/test/prismaMock.ts`.
`cd` into the project first and the relative path resolves (verified: 2 passed):

```bash
cd apis/api-users && npx vitest run --config vitest.config.mts 'src/workers/email/service/service.spec.ts'
```

Do **not** reach for `npx nx test` — the repo's `running-vitest-tests.md` rule forbids
it. (Note: that rule's workspace table does not yet list `apis/api-users`, even though
it has a `vitest.config.mts` — a gap worth closing.)

## Why This Matters

- **The silent hang (C) is the dangerous one.** The email sends, the work is done,
  but the process looks dead (exit 143). Without knowing the cause you re-investigate a
  problem that doesn't exist, or worse, conclude the email pipeline is broken.
- **`.cts` vs `.mts` (A)** is non-obvious because `tsx` runs both; the ESM failure
  surfaces as a "missing export" error that points you at the wrong thing.
- **The vitest CWD trap (D)** yields "0 tests" with no real error — easily mistaken for
  a bad path filter or a missing spec, sending you down the wrong debugging path.

## When to Apply

- Adding or changing a react-email template under `apis/api-users/src/emails/templates/` —
  use the `.cts` render script to preview before opening a PR.
- Smoke-testing the JesusFilmOne / NextSteps verification flow without the worker stack.
- Writing any throwaway script that imports from `apis/api-users/src/` — check the import
  chain for `workers/email/queue` first.
- Running api-users vitest specs from the CLI — `cd` into the project.

## Examples

The two scripts in sections A and B are complete, runnable examples (verified in the
devcontainer). The defining detail of the trigger script is the **inlined** token:

```ts
// ✅ inline — no queue import, process exits cleanly
const token = crypto.randomInt(100000, 999999).toString()

// ❌ this single import hangs the script on exit when Redis is down:
// const { generateSixDigitNumber } = require('./apis/api-users/src/schema/user/verifyUser')
```

## Related

- `docs/solutions/runtime-errors/yoga-response-cache-null-stickiness-and-zombie-process-debugging-nes1644.md`
  — same "process won't exit / stale process" symptom class, different mechanism.
- `docs/solutions/integration-issues/sandboxed-claude-code-devcontainer-setup.md`
  — same devcontainer stack (Redis, MailDev as named compose services).
- `.claude/rules/running-vitest-tests.md` — canonical vitest invocation rule; should add
  `apis/api-users` to its workspace table.
