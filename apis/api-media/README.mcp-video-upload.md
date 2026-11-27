# Video upload jobs

Issue #10554 extends the [shared image ingress](./README.mcp-image-upload.md)
for #10157. Enable `MCP_VIDEO_UPLOADS_ENABLED=true` alongside
`MCP_IMAGE_UPLOADS_ENABLED=true`. Use the existing UGC Mux account through
`MUX_UGC_ACCESS_TOKEN_ID` and `MUX_UGC_SECRET_KEY`, plus a separate
`MCP_MUX_WEBHOOK_SECRET` of at least 32 characters. Configure the webhook endpoint
as `/mcp/mux-callback`. Credentials and signed Mux upload URLs remain in Media.

`journey_media_start` accepts `kind: video_upload` with the same optional immutable
manifest, idempotency key, two-active-upload ceiling and one-hour unfinished
transfer deadline. The exact limit is 1,000,000,000 bytes. Supported inputs are
MP4 and QuickTime MOV. Filename, MIME, container signature, consecutive chunk sizes,
full byte count and SHA-256 must agree. Mux must subsequently validate the complete
container and report a video track, public playback identity and duration of at
least three seconds before the job becomes ready. Allocation and audio-only
assets cannot become playable video results.

Admin uses the same authenticated continuation page and ingress. It hashes and
sends bounded file slices rather than buffering a 1 GB file. Forwarding tickets,
originating consent, current owning permissions, permission generations, draft
state, final acceptance after locks, private output receipts, audit and retention
continue through the shared participant. A file-forwarding limitation does not
create a replacement job. Explicit resume after an authority interruption keeps
the original job, manifest, slot and transfer deadline.

## Mux dispatch and recovery

Staged video validation, hashing and provider transfer use at most one chunk of
file data at a time. A durable dispatch receipt precedes the only Mux creation
POST. The opaque server-generated UUID is its `passthrough`, with no user or
journey metadata sent to Mux. The existing MuxVideo row retains its upload ID
before the server streams bytes to the signed storage URL. No staging URL is
publicly exposed and no caller URL is fetched.

A lost creation response is reconciled by authenticated upload listing and the
exact passthrough. A bounded observation checks up to 20 pages of 100 uploads.
Absence, an unavailable page, unknown responses and timeouts preserve uncertainty
and occupied capacity. They never authorize another creation or PUT. Unresolved
large-account searches require operations reconciliation of the original attempt.
A replacement worker polls the same provider identity.

`provider_allocated` means the Mux upload is waiting for provider-side transfer
completion. `processing` means Mux has allocated an asset and is preparing it.
`ready` requires authenticated asset readiness and playable metadata. A completed
ingress transfer retains its original completion timestamp and may process beyond
its original one-hour deadline. Processing observed after six hours becomes
`reconciling`; that threshold never declares failure or releases capacity.

The [Mux direct upload API](https://www.mux.com/docs/api-reference/video/direct-uploads)
only permits cancellation while the upload is waiting. Its confirmed cancellation
prevents a concurrent late PUT from producing an asset. Lost cancellation
responses are retried through status reconciliation. Unknown writes and cleanup
failures retain capacity and unsettled participants. Once asset processing has
started, cancellation or disconnect can leave it running. Authenticated completion
settles the dispatch participant, while processing continues to occupy the shared
upload slot. Successful assets remain in the library through cancellation, undo,
result expiry and account retirement. Account retirement blocks later attachment
and purges safely completed private job payloads.

The callback route verifies exact raw bytes, HMAC-SHA256 and a five-minute timestamp
window under the endpoint-specific secret, following
[Mux signature verification](https://www.mux.com/docs/core/verify-webhook-signatures).
It treats callback fields only as a reconciliation hint. Duplicate callbacks use
the same job/receipt locks; missed callbacks recover through authenticated polling.
Neither callback readiness claims nor raw file URLs can mark a job ready. Repeated
callbacks after completion do not extend retention or recreate an asset.

A ready video returns `{ source: 'mux', videoId }` for the existing
`video_source_set` or cover-slot command. Attachment remains a separate ordinary
draft save with current authorization and revision. The initiating connection may
attach its ready upload independently of the library-grid flag. Other library
selection retains existing flag and owner rules. One save produces one history
entry and stable references. Undo/redo changes content and retains the asset.

## Operational follow-up

[Journeys MCP operations #10564](https://github.com/JesusFilm/core/issues/10564)
owns exponential provider polling backoff and 24-hour unknown-state escalation.
Those code/configuration controls remain to be implemented there. This slice
retains the existing 10-second worker cadence and supplies durable reconciliation
and the six-hour delayed state. The operations slice also owns deployed
qualification of those controls.

## Local verification and deferred checks

Run `node tools/scripts/test-mcp-video-upload.mjs`. It provisions only issue-10554
logical databases and a restricted Auth runtime role on local PostgreSQL. It runs
OAuth, MCP HTTP, Hive gateway, Journeys and Media. Firebase, private storage and
Mux network responses are explicitly controlled. The production Mux HTTP adapter,
stream validation, callbacks and owning service execute in those tests. The two
1 GB tests send every byte through the ordinary authenticated chunk route, once
with forwarding credentials and once with the Admin credential. Allow up to
90 minutes for the complete CI job on a slow runner. Coverage and executed test
counts stay in `coverage/integration/mcp-video-upload` and upload with their own
Codecov flag. Required cases cannot skip.

Normal Admin browser identity/refresh, supported live video formats, live Mux
transfer/cancellation/callback behavior, deployed ingress/bucket controls,
container qualification, operational delayed-job escalation and real
Claude/ChatGPT transcripts remain deferred feature checks. Controlled local
results are not AWS, live-provider or real-client qualification.
