# Capture event verification for #10526

Verified locally on 2026-11-10 against backend commit
`8df2a52e25444ef28c86554fad3657bb2cb1c624`. The frontend is stacked on
`phoebe/sc-issue-10524`, backend PR #10528.

## Viewer action through the API

Rendered the real `Button` in jsdom with `JourneyProvider`, block history and an
Apollo `HttpLink` calling GraphQL Yoga's fetch handler with the real journeys
schema and resolvers. The Yoga test context supplied an anonymous authenticated
user. Prisma used the isolated local database `journeys_issue_10526`, created from
the checked-in backend schema with `prisma db push`. The test did not mock event
mutations, resolvers or persistence. This verifies the component/API/database
chain; it does not exercise Firebase token acquisition or the deployed gateway.

Clicked a `decisionForChrist` Button and a `custom1` Button once each. Each action
sent its original interaction mutation and its corresponding capture mutation,
with different UUIDs. Each produced exactly two Event rows. Both captures retained
`templateFamilyId: original-family`, their played tags and `trigger: buttonClick`.
After changing the Button tag to `custom3` and the Journey family to `edited-family`,
retrying the original capture request returned its original row unchanged.

| Tag                 | Capture occurrence UUID                | ButtonClickEvent UUID                  |
| ------------------- | -------------------------------------- | -------------------------------------- |
| `decisionForChrist` | `36b4feeb-3658-4953-ab80-9c0a554e4259` | `7a97748f-d77e-4552-8512-63cdfbb4b0d9` |
| `custom1`           | `62349003-3f14-437b-9114-2a316165c14c` | `5e4b652e-37bd-4c1b-99f0-86a4965bcc4c` |

Journey: `e8aea5aa-ee92-4505-84cf-4fcc54bd8d2b`.
Step: `494b8556-1572-46a2-b766-f75a9d4738b5`.
Fixed Button: `1ca668f9-b8c7-4aaf-844a-08d6cf6b966a`.
Custom Button: `8947e5e9-1275-4a0a-a798-c42827a3a421`.

## Automated frontend coverage

The colocated hook and component suites verify all ten tag/mutation/Plausible
mappings, actual tagged Card and selected RadioOption IDs, Button/chat actions,
video start/completion tags, containing Steps and triggers. They also verify
render suppression, unsupported/null tags, footer chat, Step navigation,
non-capture video lifecycle events, repeated callbacks/rerenders, distinct action
UUIDs, unchanged UUIDs on Apollo link retries and navigation during backend failure
while the original interaction request remains pending.

## Pending deployment and warehouse checks

These UUIDs are local persistence evidence. Local rows were not sent to BigQuery
and must not be described as warehouse reconciliation evidence. Backend #10524
owns migration/deployment and warehouse transport verification. After deployment,
record a fresh fixed/custom UUID pair from an integrated viewer action and pass
it to #10524 for reconciliation. Frontend merge and stage QA still require backend
deployment verification. Browser QA requires Siyang's explicit request.
