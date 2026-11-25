# Requested image generation

Issue #10548 extends the [shared image jobs](./README.mcp-image-upload.md).
`journey_media_start` accepts `kind: image_generation` and a prompt of 1–2048
characters. It uses the ordinary editing grant and current Admin roles. There is
no additional user opt-in. Server rollout configuration is not a user permission.

Tool instructions require an explicit generation request or an accepted suggestion.
An intent flag supplied by a model cannot prove human consent. These instruction
fixtures travel with the final real-agent release scenarios:

| User instruction                                                       | Expected tool behavior                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| "Improve the wording and layout"                                       | Edit only, zero generation jobs                                    |
| "Choose a photo from my existing library"                              | Search/select existing media, zero generation jobs                 |
| Agent suggests "I could generate a background" with no user acceptance | Zero generation jobs                                               |
| User says "Yes, generate that background"                              | Start `image_generation` under the editing grant                   |
| "Generate an image of a quiet garden"                                  | Start `image_generation` without an extra server permission prompt |
| The same request loses its response                                    | Retry the exact key/payload, then poll the same job                |

The owning service never generates from content edits, source selection, attachment
or undo/redo. Automated tests exercise those production paths with controlled
provider failures. Real Claude/ChatGPT interpretation of these fixtures remains a
deferred final-release check.

## Dispatch accounting and authority

The Media user row serializes generation admission across connections and replicas.
Only one generation may be active for a user. Image/video upload capacity is
independent. A user can dispatch at most ten new generations in `(now - 24h, now]`.
The send boundary stores `dispatchedAt` before the provider call. Definitively
rejected and uncertain dispatched jobs count. An exact retry uses the original
job, provider identity and usage. Admission denial, authority denial and positively
fenced unsent attempts consume no dispatch allowance. A crash after the send
marker is uncertain and retains its usage and active slot.

Generation starts at `dispatch_pending` without file ingress or a transfer deadline.
Every dispatch uses the real shared Media executor and current owning Journey
rights, captured grant/permission generations and Auth final acceptance after
owning locks. Consent renewal or role changes require explicit same-job resume,
using `journey_media_status` with `resume: true`. Status alone never resumes
authority-interrupted work. The MCP resume response acknowledges queued work;
the worker rechecks authority before dispatch. For an already dispatched generation,
explicit resume makes the next status observation due without repeating creation.
Cancellation, private result release and attachment
each require fresh authority. Withdrawal remains Pending for unresolved sends
or an unconfirmed private-output executor.

Prompts are stored only as private pending job input, omitted from responses and
audit, and cleared at the durable send boundary or unsent terminal cleanup. Payload
fingerprints retain exact-replay identity without the prompt. Provider exceptions
are replaced with fixed errors. Credentials stay in Media configuration.

## Provider recovery and retained assets

The production adapter calls Cloudflare Workers AI
[`@cf/black-forest-labs/flux-1-schnell`](https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/),
validates the returned JPEG and uploads it once with the persisted Images identity.
It uses explicit fetch calls with bounded responses/timeouts and no SDK retries.
The existing synchronous Stable Diffusion model is deprecated according to its
[provider documentation](https://developers.cloudflare.com/workers-ai/models/stable-diffusion-xl-base-1.0/).
The adapter uses the documented FLUX response and its 2048-character prompt bound.

Cloudflare Images authenticated details plus the
[original-image blob](https://developers.cloudflare.com/api/resources/images/subresources/v1/subresources/blobs/methods/get/)
establish readiness and decoded metadata. Allocation alone is not ready. A missing
asset never proves that generation stopped. A lost synchronous Workers AI outcome
has no qualified retrieval path. Keep `reconciling`, retain usage/capacity, and poll
the same job rather than issue another generation POST. The 15-minute observation
threshold marks prolonged processing as uncertain; it is not cancellation evidence.
Observation attempts and their next due time persist across workers, doubling
from 10 seconds up to five minutes. Status returns `nextObservationAt`.
After 24 hours, `operationsRequired` signals investigation of the recorded job/provider identity and
executor receipts. Do not release its slot or settle withdrawal from age, 404 or
lease expiry. This version provides no operator override that fabricates stop
evidence. A later positively recovered asset can settle the original job.

Safe pre-send cancellation clears the prompt and releases the slot. Dispatched
cancellation reconciles the same provider identity. Successful images are retained
as `CloudflareImage` with `isAi: true`, including unattached images and images from
cancelled connections or retired accounts. No image/video deletion is added.

A ready job uses the shared `{ source: 'upload', jobId }` acquired-media reference.
Attach with a separate `journey_edit` image/slot command against a fresh ordinary
draft revision. The save has its own history entry; replay adds none. Undo/redo
changes content without deleting or regenerating the library asset. View-only,
revoked and published writes remain denied. The media-library grid flag does not
gate requested generation or attachment. Public Admin asset delivery is unchanged.

## Configuration and evidence

Keep the image-job prerequisites configured, then set
`MCP_IMAGE_GENERATION_ENABLED=true` and a server-only
`CLOUDFLARE_WORKERS_AI_TOKEN` with Workers AI access. Existing
`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_IMAGES_TOKEN` own Images upload/status/blob
access. Disabling the generation rollout flag denies new generation; it does not
delete assets or authorize repeating outstanding calls. Apply the additive Media
migration before enabling the capability.
`MCP_GENERATION_POLL_INTERVAL_MS` configures the initial observation interval
between 1 second and 5 minutes. `MCP_GENERATION_OBSERVATION_MS` configures the
processing warning threshold, default 15 minutes, between 1 second and 24 hours.
Neither setting cancels work or changes dispatch entitlement.

Run `node tools/scripts/test-mcp-image-generation.mjs` with
`MCP_UPLOAD_TEST_POSTGRES_URL` pointing to isolated local PostgreSQL. The runner
creates issue-10548 logical databases and a restricted Auth runtime role, applies
migrations and executes the image-upload suite plus generation regressions.
OAuth, MCP HTTP, gateway, owning services and SQL are production implementations.
Firebase, storage and provider outcomes are explicitly controlled. Adapter tests
exercise the actual generation HTTP implementation. Required cases cannot skip.
Coverage uses repository-relative paths in
`coverage/integration/mcp-image-generation`, separate from other jobs/shards.

Normal Admin browser flows, live provider qualification, deployment/container
controls and real-agent instruction transcripts remain deferred feature checks.
Controlled local results are not AWS, live-provider or real-client evidence.
