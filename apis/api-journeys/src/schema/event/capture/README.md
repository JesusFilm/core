# Capture API contract for #10526

Backend issue #10524 adds explicit capture sends alongside existing interaction sends.
Existing interaction mutations and Plausible names stay unchanged. No interaction mutation
creates captures automatically. No support exists for `share` or `inviteFriend`.

| Block tag                  | Stored and GraphQL typename      | Plausible identity          | Mutation                               |
| -------------------------- | -------------------------------- | --------------------------- | -------------------------------------- |
| decisionForChrist          | ChristDecisionCaptureEvent       | christDecisionCapture       | christDecisionCaptureEventCreate       |
| gospelPresentationStart    | GospelStartCaptureEvent          | gospelStartCapture          | gospelStartCaptureEventCreate          |
| gospelPresentationComplete | GospelCompleteCaptureEvent       | gospelCompleteCapture       | gospelCompleteCaptureEventCreate       |
| prayerRequest              | PrayerRequestCaptureEvent        | prayerRequestCapture        | prayerRequestCaptureEventCreate        |
| rsvp                       | RsvpCaptureEvent                 | rsvpCapture                 | rsvpCaptureEventCreate                 |
| specialVideoStart          | SpecialVideoStartCaptureEvent    | specialVideoStartCapture    | specialVideoStartCaptureEventCreate    |
| specialVideoComplete       | SpecialVideoCompleteCaptureEvent | specialVideoCompleteCapture | specialVideoCompleteCaptureEventCreate |
| custom1                    | Custom1CaptureEvent              | custom1Capture              | custom1CaptureEventCreate              |
| custom2                    | Custom2CaptureEvent              | custom2Capture              | custom2CaptureEventCreate              |
| custom3                    | Custom3CaptureEvent              | custom3Capture              | custom3CaptureEventCreate              |

Each input is named `<Typename>CreateInput`. All ten have exactly these required fields:

- `id: ID!`: a new occurrence UUID. Allocate a separate UUID from the interaction row.
  Reuse it for retries of this capture only.
- `blockId: ID!`: the actual tagged block in the played journey. For a Card capture,
  send the Card ID, not the Step ID. For radio, send the selected RadioOption ID,
  not the RadioQuestion ID.
- `stepId: ID!`: the containing Step ID in the played journey.
- `trigger: CaptureEventTrigger!`: `stepView` for Card, `buttonClick` for Button,
  `radioQuestionSubmit` for RadioOption, `videoStart` or `videoComplete` for Video.
  Start checks `eventLabel`; completion checks `endEventLabel`.

All ten mutations return their non-null concrete Event type, exposing `id`, `__typename`,
`journeyId`, `createdAt`, `blockId`, `stepId`, `captureIdentity`, `captureTag`, `trigger`
and nullable `templateFamilyId`. Inherited `label` and `value` remain null on capture rows.
`captureTrigger` is the storage column behind GraphQL `trigger`.

Use the same anonymous Firebase authentication as existing event sends. The server
resolves visitor, journey and team from authenticated identity and the block. Inputs
cannot supply visitor, team, journey, tag or family overrides. The mutation fixes the
capture identity; a mismatched current tag or invalid block/Step context is rejected
with `BAD_USER_INPUT`, without switching capture type. No Event row is created.

Family is snapshotted as `journey.id` when `template` is true, otherwise
`fromTemplateId`, or null for a standalone journey. There is no recursive family lookup.
A copy of a copy uses its own stored `fromTemplateId`; a promoted template uses its own ID.
The played journey supplies the tag, never its parent template. Later edits do not
change saved captures.

Same-ID delivery returns the original row when authenticated user, concrete type,
block, Step and trigger match, even after content edits. Different context or identity
using that UUID returns `CONFLICT`. Concurrent retries are protected by the Event primary
key. Distinct UUIDs always remain distinct occurrences, including for one visitor/tag.

```graphql
mutation ChristDecisionCapture($input: ChristDecisionCaptureEventCreateInput!) {
  christDecisionCaptureEventCreate(input: $input) {
    id
    __typename
    journeyId
    blockId
    stepId
    captureIdentity
    captureTag
    trigger
    templateFamilyId
    createdAt
  }
}
```

```json
{
  "input": {
    "id": "cb7de0cf-1ae9-4554-a02e-0add20463076",
    "blockId": "actual-tagged-card-id",
    "stepId": "containing-step-id",
    "trigger": "stepView"
  }
}
```

Interaction timelines (`Visitor.events`, `JourneyVisitor.events`) and journey event
lists/counts explicitly exclude all capture typenames, including when requested in an
interaction filter. CSV exports also exclude captures; Sheets already allowlists
submission types. Capture mutations do not increment activity/duration, update response
snapshots, enqueue notifications or sync additional responses. Every capture type is
registered with the Event GraphQL interface for abstract resolution.

Backend deployment and warehouse verification remain required before frontend merge
and stage QA. See [warehouse verification](./warehouse-verification.md).
