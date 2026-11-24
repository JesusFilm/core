# Image upload jobs

Issue #10560 implements the image path in #10153 and #10157. Video upload and
requested generation extend the shared job protocol in their own tickets.

`journey_media_start` admits `kind: image_upload` with an idempotency key and an
optional file manifest. The first manifest binds one filename, content type,
actual byte count and SHA-256 for the job. The application accepts at most
10,000,000 image bytes. PNG, JPEG, WebP and GIF are qualified by local decoder
fixtures. SVG, AVIF, HEIF and other unqualified input formats are rejected.
Image dimensions and aggregate animation pixels follow the
[Cloudflare hosted-image limits](https://developers.cloudflare.com/images/get-started/limits/).
No remote source URL is accepted or followed.

The Media database serializes admission through one user row across connections
and replicas. At most two active image/video upload or processing jobs are allowed.
Configuration can lower this ceiling to one. Admission sets a fixed one-hour transfer deadline. Polling, refreshing,
replaying, renewing consent and changing transports preserve the job and deadline.
Ready assets release capacity independently of attachment. An uncertain input
write or provider send keeps capacity occupied.

## One ingress for both transports

The Admin locator is `/mcp/uploads/<job-id>` and contains no credential. Its
server-rendered page checks the initiating Firebase user and current originating
connection grant at Media before showing the file picker. Every later request
repeats those checks. A broader Admin session cannot replace the originating edit
grant. Responses use private/no-store and no-referrer controls. The browser sends
an explicit Firebase authorization header, omits ambient cookies, and uses the
configured exact Admin origin. The route does not accept cookie-only requests.

MCP file forwarding uses the separately returned job-bound `ingressTicket` in the
`Authorization: Upload <ticket>` header against `ingressUrl`. The ticket has a
separate ingress audience and expires at the original transfer deadline. It never
replaces current connection/role checks. Do not put it in URLs or display it in
chat. A forwarding adapter must supply bytes; arbitrary download URLs and
unqualified client file-reference extensions are not supported.

Both transports call the same Media HTTP route outside GraphQL body parsing:

- `GET`: current authorized state.
- `POST`, `X-Upload-Action: bind`: the bounded JSON file manifest.
- `PUT`: at most 1,048,576 raw bytes, with `X-Upload-Offset` and
  `X-Upload-Sha256`. Chunks are consecutive, with a shorter final chunk. Exact
  partial-transfer retries reuse the stored checksum/object identity. After a
  lost response, read status before resuming from `receivedBytes`. HTTP success
  alone does not acknowledge a chunk. If `receivedBytes` has not advanced, stop
  sending and retry the same file or poll for reconciliation.
- `POST`, `X-Upload-Action: resume`: validate completed input and request fresh
  dispatch authorization, or reconcile the existing provider identity.
- `POST`, `X-Upload-Action: cancel`: request safe cancellation of the same job.

Private S3 objects use a server-owned prefix and encryption. There are no public
staging URLs, presigned object writes or provider upload credentials in tool or
browser results. Each durable input-write receipt records the exact object hash.
A lost PUT response is reconciled through a strong read of that immutable object.
The durable pre-write intent is fenced under the receipt lock before any send
can start. A separate writing marker precedes the external PUT. Qualified S3
403 authentication/authorization rejections and 400 EntityTooLarge responses
from one confirmed send, as defined by the [S3 error codes](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Error.html),
persist rejection, remove only the unstored chunk reservation and settle its
permit. SDK retries are disabled so a later rejection cannot hide an earlier
uncertain send. The same file/chunk identity can then retry on the original job
before its original deadline. Cancellation and expiry can clean up safely.
Missing objects and expired leases are not positive stop evidence for a writing
receipt, including legacy staging receipts. Temporary cleanup waits for unresolved
writes and positively fenced executors.

After the final chunk commits, the media worker advances the original job from
PostgreSQL. A replacement worker can validate and dispatch with fresh rights under
the same grant version and permission-gate generations even if the uploading
client disconnects. Admission persists a hash of the account, connection,
journey, team and user-membership gate generations captured before rights reads
and checked again at final acceptance. Consent renewal or a permission change
cannot restart unfinished work, including role removal and restoration while
the worker is offline. An explicit authorized same-job resume binds progression
to the current version and generations without changing the file, capacity or
transfer deadline. Jobs predating either binding also require explicit
resume. MCP status reads return committed progress
while storage or the provider is slow. Poll the same job until it reaches a
terminal state before using its ready asset in a separate edit.

Admin offers "Resume image processing" for `validating` and `dispatch_pending`,
including after refresh or a lost final PUT response. It uses the same authorized
resume route without rebinding the file or admitting another job.

## Dispatch, output and attachment

Gate generations are captured before owning rights reads. Final acceptance locks
the owning user or job before checking current generations, connection state and
current time at Auth. Each stage validates its locked state before acceptance.
Admission,
each chunk, dispatch, cancellation and private output are separate bounded actions.
Accepted physical output holds a permit until the actual Node response finishes or
closes. Unknown provider sends and unconfirmed output executors keep withdrawal
Pending. Recovery locks the same receipt before fencing a delayed executor.
Output receipts additionally persist the Linux boot ID, PID namespace, process ID
and process start ticks. Recovery in that same boot and PID namespace can prove
the original process exited or its PID was reused, then fence and settle it.
A task identity from the server-controlled ECS v4 metadata endpoint is also
persisted when Media runs on ECS. Across host/container replacement, recovery
uses read-only DescribeTasks and requires the exact task and cluster ARNs with
lastStatus STOPPED. Desired stop, a missing task, a timeout or a denied lookup
supply no stop evidence. See the [task metadata contract](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v4-response.html)
and [DescribeTasks](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_DescribeTasks.html).
Live processes, unverified foreign executors and legacy receipts without an
identity remain pending. The Media runtime requires readable Linux procfs for
new output admission. ECS deployments additionally need task metadata and
read-only ecs:DescribeTasks access for the owning task/cluster. Applying and
qualifying those deployment permissions stays with the existing operations
owners. Local tests use real process stop evidence and a controlled ECS adapter;
they do not establish deployed ECS recovery.

Cloudflare POST uses the persisted custom image identity once. A lost response
never causes another POST. Authenticated Cloudflare details reconcile readiness;
allocation/draft status is not ready. This implementation polls authenticated
status and does not consume unauthenticated webhook payloads. Known handoff can
settle the short dispatch participant while provider processing retains the job's
capacity. An unknown handoff stays unresolved. Cloudflare has no qualified
in-flight cancellation guarantee, so cancellation after dispatch reconciles the
existing image and retains successful assets.

Definitive rejection is deliberately narrow. HTTP 401, 403, 413 and 415 with a
valid Cloudflare failure envelope and no result mean the request was refused,
as specified by [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-client-error-4xx).
The executor persists `rejected` before cleanup. Recovery retries private staging
cleanup before releasing capacity and settling the receipt, even if authenticated
status returns 404. Network failures, timeouts, conflicts, 5xx, other unqualified
statuses and contradictory or malformed bodies remain unresolved. Provider error
messages are not stored or returned.

A ready result returns an `upload` source reference for a separate `journey_edit`
image or owned-slot command. This requires current target rights/grant, ordinary
draft state and the current revision. Upload attachment does not require the
media-library grid flag. Undo/redo changes content only and keeps the asset.
Existing public Admin media delivery remains unchanged. Metadata, results and
source discovery still require current authority.

Detailed job and cancellation results expire 30 days after completion. Payload
fingerprints, immutable IDs and key markers remain for duplicate prevention.
Reads and renewals do not extend retention. Account retirement blocks new
admission/dispatch/attachment and purges safe private job payloads, while unresolved
provider/input work retains reconciliation state. It never deletes library
images. The existing Auth audit records typed media actions with 90-day expiry;
filenames, content, credentials and raw provider errors are excluded.

## Configuration and local evidence

Enable `MCP_IMAGE_UPLOADS_ENABLED=true` only alongside the existing media source
participant and its Auth configuration. Media additionally requires:

| Variable                                           | Purpose                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `JOURNEYS_ADMIN_URL`                               | Exact authenticated Admin origin                                       |
| `MCP_MEDIA_INGRESS_URL`                            | Public HTTPS Media ingress origin, localhost permitted for development |
| `MCP_MEDIA_UPLOAD_TICKET_SECRET`                   | Separate secret, at least 32 characters                                |
| `MCP_MEDIA_STAGING_BUCKET`                         | Encrypted private staging bucket, Media runtime access only            |
| `MCP_MEDIA_UPLOAD_LIMIT`                           | Shared per-user image/video active cap, 1 or 2, default 2              |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_IMAGES_TOKEN` | Existing server-controlled Images configuration                        |

Admin uses `MCP_MEDIA_INGRESS_URL` for its authenticated continuation page. Configure
HTTPS ingress for the raw chunk route and OPTIONS, allow at least 1 MiB bodies,
and permit bounded 30-second chunk transfer and 60-second owning work. Block
public S3 access and grant Media only its staging prefix. Apply migrations before
enabling admission. Do not install an age-only S3 lifecycle rule that can delete
active or unresolved input. AWS provisioning and deployed ingress qualification
remain with the deployment/operations tickets.

Run `node tools/scripts/test-mcp-image-upload.mjs` against isolated local PostgreSQL.
It creates only issue-10560 logical databases and a restricted Auth runtime role,
applies normal migrations, and runs OAuth, MCP HTTP, Hive gateway, Journeys and
Media. Firebase, external storage and Cloudflare are declared controlled adapters.
The production provider/storage adapters have separate failure and content tests.
No database-dependent required tests may skip. Reports and Codecov uploads use
`coverage/integration/mcp-image-upload`, preserving other suites and shards.

Normal Admin browser identity/refresh/resume qualification, live provider format
and cancellation evidence, deployed private-bucket/ingress controls, container
qualification and real Claude/ChatGPT transcripts remain deferred feature checks.
Local controlled tests do not establish browser, AWS or live-provider acceptance.
