# Existing media in MCP draft edits

Issue #10559 adds `journey_media_search` and the closed `image_set`,
`image_source_clear`, `video_source_set`, `video_source_clear`, `video_settings_set`, `media_slot_set`
and `media_slot_clear` commands. Upload and generation remain separate capabilities.

Search requires a granted journey and current Admin rights. Its sources are
`library`, `history`, `unsplash`, `internal`, `languages`, `youTube` and `mux`.
Language and YouTube lookup require `videoId`. Follow `nextCursor` with identical
filters. Cursors bind the subject, connection, grant, journey revision and source
generation. Source records, private results and history never use guest access.
Ready provider file URLs keep their existing public delivery behavior.

Library images and Mux sources must be ready and personally owned or shared with
the target journey's team under current membership. Historical images belong to
the granted journey. Catalog videos require a published, permitted Journeys
variant in the selected language. YouTube IDs are canonical 11-character IDs.
The media service derives metadata through fixed provider origins and rejects
unsafe redirects. Catalog HLS resolution follows bounded allowlisted public provider redirects and verifies a playable manifest. Caller-provided URLs and dimensions are not source identities.

`mediaLibrary` and `websiteMode` use the same LaunchDarkly user context as Admin.
Library/history selection and Mux history follow `mediaLibrary`; Unsplash and
sparse image presentation edits do not. Logo slots require website mode and its
flag. Provider, Firebase or flag failures never create broader authority.

## Local services

Keep the existing api-auth, api-mcp, gateway and Journeys granted-edit configuration.
Enable `MCP_MEDIA_ENABLED=true` in Journeys and media only after applying the media
migration and configuring both participants. Configure these additional values
through the normal local secret/configuration route:

| Service      | Configuration                                                                                                                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| api-auth     | `AUTH_READ_MEDIA_SECRET`, `AUTH_PERMISSION_MEDIA_SECRET`, distinct from existing service credentials                                                                                                                                                                   |
| api-journeys | `MCP_MEDIA_OWNER_URL`, the media service's `/mcp/media-sources` endpoint; `MEDIA_MCP_INTERNAL_SECRET`                                                                                                                                                                  |
| api-media    | Existing MCP read issuer, gateway audience, environment and public key; `MCP_READ_AUTHORITY_URL`; `MEDIA_MCP_INTERNAL_SECRET`; `MEDIA_MCP_AUTHORITY_SECRET`, matching auth's read-media secret; `MCP_PERMISSION_MEDIA_SECRET`, matching auth's permission-media secret |
| api-media    | Normal journeys/media/languages database URLs, Cloudflare image account, Unsplash and YouTube provider settings, Firebase and LaunchDarkly configuration                                                                                                               |

The media service owns source validation. The source HTTP route accepts a signed,
request-bound internal envelope and an existing owning permit, never a public URL
or general service token in place of a grant. Provider calls finish before the
Journeys content transaction starts. Final attachment acceptance still checks
current consent, rights, draft state, source generation and revision.

Source writes use one conservative `media:sources` authorization gate. A source
change cancels prepared attachments and returns Pending while accepted work is
unsettled. Worker writes and interactive media transactions participate through
the scoped Prisma client. The source write and owning mutation receipt commit
together. A PostgreSQL transaction owns the source executor lock before publishing
its receipt and retains it through authorization, execution and outcome reporting.
Other workers' recovery sweeps skip that lock without waiting. After ownership is
lost, recovery takes the receipt lock before fencing delayed SQL work or reporting
a committed result. Delayed executors still check their receipt before dispatch.
An uncertain external deletion keeps admission
closed until an explicit authorized retry settles it. Age and missing responses
never prove that a provider stopped. This gate favors correctness over unrelated
source-write concurrency during the initial buildout.

Ordinary image clearing retains its block and dimensions. Ordinary Video clearing retains its block, playback preferences and layout, and clears its source and owned poster together. Source selection accepts nested playback settings for one atomic gesture. Owned-slot clearing
updates the owner reference and soft-deletes its owned child. Undo restores the
same IDs under current rights and source checks. Neither path deletes successful
provider assets. Account deletion adds no image or video cleanup.

YouTube video discovery uses the configured Data API key. Caption discovery requires
OAuth with the [documented caption scope](https://developers.google.com/youtube/v3/docs/captions/list).
Configure `YOUTUBE_CAPTIONS_ACCESS_TOKEN`, or `YOUTUBE_CAPTIONS_CLIENT_ID`,
`YOUTUBE_CAPTIONS_CLIENT_SECRET` and `YOUTUBE_CAPTIONS_REFRESH_TOKEN`. Tokens stay
server-side. Without caption authorization, eligible videos remain selectable and
report subtitle discovery as unavailable; selecting an unverified subtitle fails.

Existing Cloudflare, Mux, catalog-video and video-variant deletion resolvers close
source admission before dispatching provider effects. Unknown provider outcomes
keep the gate closed. An authorized retry treats confirmed provider absence as
settled without deleting any asset as part of a draft edit.

## Automated checks

Run `node tools/scripts/test-mcp-media.mjs`. It creates only issue-10559 databases
on a local PostgreSQL server, applies normal migrations and executes real OAuth,
MCP HTTP, Hive gateway, Journeys and media participants against those databases.
`MCP_MEDIA_TEST_POSTGRES_URL` can select another isolated local PostgreSQL port.
Firebase identity/eligibility and external provider responses are controlled;
source ACLs, grants, source gates, SQL writes, receipts and inverses are real.
There are no required skipped tests. The runner rejects missing executed-module
coverage. Reports stay in `coverage/integration/mcp-media`, independently of
other projects and shards, and the MCP integration workflow uploads them to Codecov.

Normal Admin rendering, live Firebase/media configuration, provider qualification
and real-client acceptance remain deferred feature checks. These tests provide
local backend evidence and do not claim browser, live-provider or AWS execution.
