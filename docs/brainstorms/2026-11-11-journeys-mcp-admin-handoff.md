# Journeys MCP draft preview and Admin publishing handoff

Research for [Verify how an ordinary creator previews and publishes an MCP-created draft](https://github.com/JesusFilm/core/issues/10536), part of [Wayfinder for the Journeys MCP draft-authoring release](https://github.com/JesusFilm/core/issues/10532). Investigated 11 November 2026 against `593400f9201d0b2acccea67835613639619bf527`, the checked-out `origin/main` source revision. All code links below pin that revision. This is a research artifact, not an implementation or release approval.

## Finding

An ordinary authorized creator can open a private draft in the existing Admin editor. The rest of the proposed handoff is incomplete. Today's Preview button refreshes a public viewer page, which excludes drafts. There is a `journeyPublish` backend mutation, but its only ordinary-journey UI callers are account-conversion flows during sign-in or registration. The editor's Share button distributes a URL; it does not publish. A real draft preview and an explicit Manage-authorized Publish control are required.

Draft status also does not establish API privacy today. The public single-journey resolver accepts an omitted status filter or an explicit draft filter. Journey federation entity resolution and `journeySimpleGet` lack equivalent Read checks. These paths must close before private MCP drafts ship. Source inspection and isolated mocked-source probes support these findings. No staging playback, publication, cache-isolation or deployed-gateway test was executed.

The companion investigation is [Define the agent commands and instructions for authoring a journey](https://github.com/JesusFilm/core/issues/10535). Its command contract supplies the create/edit operations; this note covers the human handoff and its privacy gates.

The intended behavior comes from [Draft-authoring plan](https://github.com/JesusFilm/core/issues/10153), [First-release requirements and acceptance tests](https://github.com/JesusFilm/core/issues/10157), [Backend permission map](https://github.com/JesusFilm/core/issues/10152), and [Mike's source review](https://github.com/JesusFilm/core/issues/10153#issuecomment-6754344866). Their acceptance boxes remain unexecuted here. MCP does not exist in the inspected code, so MCP denials and publication races below are future release tests.

## The existing creator path

| Step            | Concrete entry or control                                                      | What the code does                                                                                                                                                                                                    | Result for a genuine draft                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Find the draft  | Admin home, Team Projects, Active; or Shared With Me for a direct collaborator | Active includes `draft` and `published`. A draft is not a separate tab.                                                                                                                                               | Draft can appear if current user Read permits it.                                                                                                                          |
| Open it         | `/journeys/{journeyId}`                                                        | Server requires Admin auth, initializes account eligibility, calls `adminJourney` by database ID, then the client queries the same authorized object. A template redirects to `/publisher/{id}`.                      | Ordinary owner, journey editor, team manager or member can open an ordinary draft. No super-admin role required.                                                           |
| Inspect content | Editor Canvas and JourneyFlow                                                  | Selected Step renders through selection, drag and inline-edit wrappers in `renderMode: 'admin'`.                                                                                                                      | Visual inspection and editing work. This is not end-to-end branching playback.                                                                                             |
| Click Preview   | Toolbar play icon, accessible name `Preview`; opens a new tab                  | Links to `/api/preview?slug={slug}` and optionally `hostname={customDomain}`. No status or role condition beyond a nonempty slug in the component.                                                                    | The control exists but does not supply private draft playback.                                                                                                             |
| Preview API     | Admin `/api/preview`                                                           | Checks that session tokens exist, then requests viewer `/api/revalidate` using a server-held revalidation secret. Waits 300 ms and redirects 307 to the public slug. Does not load the journey or check its Read ACL. | An authenticated stranger can reach the refresh/redirect logic; no draft authorization is added. Signed-out callers receive 403 when environment configuration is present. |
| Viewer          | Root slug, domain slug, step route, embed                                      | Static generation queries `journey` with every status except `draft`.                                                                                                                                                 | Draft returns not-found regardless of who clicked Admin Preview.                                                                                                           |
| Share           | Editor `Share`, then Copy Link, Edit Link, QR Code or Embed                    | Constructs public URL and sharing artifacts.                                                                                                                                                                          | Does not change draft status or grant public access.                                                                                                                       |
| Publish         | No explicit ordinary-draft control found in Editor, its menu or journey list   | `journeyPublish` exists; registration/sign-in call it when converting an anonymous account and extracting a journey ID from the redirect.                                                                             | An already signed-in creator cannot use that account-conversion flow as the normal Publish handoff.                                                                        |

Primary sources: [Active list](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/JourneyList/ActiveJourneyList/ActiveJourneyList.tsx#L39-L55), [editor route and denial handling](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/pages/journeys/%5BjourneyId%5D.tsx#L124-L204), [Editor provider](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/Editor/Editor.tsx#L48-L85), [Canvas rendering](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/Canvas.tsx#L360-L380), [Preview control](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/Editor/Toolbar/Items/PreviewItem/PreviewItem.tsx#L20-L43), [new-tab Item](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/Editor/Toolbar/Items/Item/Item.tsx#L89-L108), [preview handler](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/pages/api/preview.ts#L17-L66), [Share control](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/Editor/Toolbar/Items/ShareItem/ShareItem.tsx#L91-L106), [toolbar items](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/Editor/Toolbar/Items/Items.tsx#L11-L39), [registration publish caller](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/SignIn/RegisterPage/RegisterPage.tsx#L92-L109), [provider sign-in publish caller](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx#L71-L83).

The negative UI finding is a repository search result, not a browser observation. Search `journeyPublish|JOURNEY_PUBLISH` under `apps/journeys-admin`, excluding generated files and specs. Only the two sign-in components call it. `JourneyUpdateInput` has no status field, so the general editor update is not another publication control. Campaign and template-gallery Publish buttons act on different entities. [Journey update input](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/inputs/journeyUpdateInput.ts#L8-L45).

### Identity and preview tokens

The revalidation token is a server-to-server cache-refresh secret. Viewer `/api/revalidate` compares it and calls `res.revalidate`; it is neither a user credential nor a preview capability. Admin does not append that secret or an Admin user token to the redirected browser URL. Viewer static requests have no user auth link. Browser viewer requests obtain their own persisted Firebase identity or sign in anonymously; this does not transfer the Admin session or override the static draft filter. [Revalidation endpoint](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/pages/api/revalidate.ts#L20-L49), [viewer Apollo identity](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/src/libs/apolloClient/apolloClient.ts#L22-L68), [root viewer static props](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/pages/home/%5BjourneySlug%5D.tsx#L97-L150).

## Status, publication and permissions

The stored statuses are `draft`, `published`, `archived`, `trashed`, `deleted`. There is no `unlisted` status. Existing blank `journeyCreate` writes `published`, sets `publishedAt` and creates an owner relation. Template duplication can create a draft with `duplicateAsDraft: true`. Therefore an MCP blank draft requires the proposed new transactional backend command; invoking today's blank-create resolver does not meet the private-draft contract. [Status enum](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/libs/prisma/journeys/db/schema.prisma#L379-L385), [blank create](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journeyCreate.mutation.ts#L40-L66), [duplicate status and owner](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journeyDuplicate.mutation.ts#L263-L318).

`journeyPublish` loads the owning team and direct journey memberships, checks `journeyAcl(Action.Manage, ...)`, then updates `status` to `published` and `publishedAt` to the current time. A denied caller receives `FORBIDDEN` and never reaches the update. It has no draft-only predicate, expected-revision argument, transaction joining the authorization read and write, or viewer revalidation call. These are current-code observations, not claims about a successful deployed publish. [Publication resolver](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journeyPublish.mutation.ts#L10-L45).

### Ordinary journey role matrix

These rows assume no platform publisher privilege. Roles can accumulate; a journey Editor who is also a team Manager can publish through the manager permission.

| Current relationship to the ordinary journey | Admin Read | Admin Update | Manage, including publish | Team Create |
| -------------------------------------------- | ---------- | ------------ | ------------------------- | ----------- |
| Direct journey Owner, no team membership     | Yes        | Yes          | Yes                       | No          |
| Direct journey Editor, no team membership    | Yes        | Yes          | No                        | No          |
| Owning-team Manager                          | Yes        | Yes          | Yes                       | Yes         |
| Owning-team Member, no owner relation        | Yes        | Yes          | No                        | Yes         |
| Invite requested only, or stranger           | No         | No           | No                        | No          |

A member who creates a journey becomes its owner, so they can publish that journey despite Member alone lacking Manage. The new draft command should preserve that ownership behavior. `adminJourney` enforces Read after loading current relations; `adminJourneys` intersects with a database access predicate. The existing single-object scope also admits Firebase anonymous identities for legacy guest flows. The new MCP and private preview contracts require a signed-in eligible account, not merely the existence of some Firebase identity. [ACL](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journey.acl.ts#L61-L211), [single Admin read](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/adminJourney.query.ts#L12-L49), [list filter](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/adminJourneys.query.ts#L16-L90), [auth scopes](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/authScopes.ts#L94-L100).

### MCP read and preview matrix required by the settled contract

All rows require a current signed-in eligible user. Every MCP request also requires an active matching client grant, evaluated in the owning backend. A browser opening a normal Admin link is a separate human action, covered below.

| Resource and caller                                                                                  | Required MCP read and preview result                                                  |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Ordinary draft, current Owner/Editor/Manager/Member with matching resource read grant                | Allow                                                                                 |
| Same user can read draft B in Admin, client grants only A                                            | Deny B by list, ID, slug, block, entity and preview; return no link or metadata for B |
| Ordinary published journey, stranger has public URL                                                  | Deny MCP; ordinary public viewer remains allowed                                      |
| Ordinary published journey, current Admin Read plus matching resource grant                          | Allow read and preview; refuse MCP writes                                             |
| Published global template, catalog grant, no publishing-team membership                              | Allow signed-in catalog read and preview                                              |
| Unpublished global template, no current authoring Read                                               | Deny even with catalog grant                                                          |
| Team template, current owning-team member plus matching grant                                        | Allow according to the draft/read rules                                               |
| Team template, no owning-team membership, even with direct journey role or platform publisher status | Deny                                                                                  |
| Revoked grant, removed relevant role/membership, expired or wrong-audience credential                | Deny subsequent delegated requests, including warm-cache and preview-link requests    |

Today's published-template Read exception includes every team, and the list predicate separately lets platform publishers list all templates. Local templates and platform publishers also have broader Manage exceptions. Do not reuse these exceptions as the MCP catalog policy. Nor should the ordinary-journey Editor-denied-publication fixture use a platform publisher account, because the publisher Manage branch can broaden that user's effective rights. [Read/list and publisher exceptions](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journey.acl.ts#L36-L113), [local-template Manage](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journey.acl.ts#L134-L160).

### Lifecycle surprises that affect a private draft

The public viewer's status filter includes archived, trashed and deleted journeys. Archiving a never-published draft therefore moves it into a viewer-eligible status. `journeysRestore` always sets `published` and a new `publishedAt`, even though the UI's optimistic Restore/Unarchive response predicts `draft` when the item had never been published. Archive then Unarchive is an incidental path to publication. It is not an acceptable replacement for an explicit Publish action. [Viewer filter](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/src/libs/journeyQueryOptions/journeyQueryOptions.ts#L3-L12), [archive mutation](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journeysArchive.mutation.ts#L36-L52), [restore mutation](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journeysRestore.mutation.ts#L37-L52), [Unarchive UI](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/ArchiveJourney/ArchiveJourney.tsx#L27-L31), [optimistic restore](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/RestoreJourneyDialog/RestoreJourneyDialog.tsx#L46-L65).

The smallest safe release choice is to disable Archive/Trash/Restore for never-published drafts until those transitions preserve unpublished intent, or implement that preservation with a backend public-eligibility rule. Do not merely remove the UI action while leaving an API path that can expose the draft. Preserve existing legitimate public delivery for already-published journeys. Confirm historical `publishedAt` data before adopting it as the definitive publication marker; this investigation did not inspect production data.

## API and cache evidence

| Path                                 | Current primary-source behavior                                                                                                  | Consequence and required check                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adminJourney`, `adminJourneys`      | Auth plus object Read or access predicate                                                                                        | Useful basis for human Admin route; MCP additionally needs grant intersection and stricter template rules.                                                                             |
| `journey(id, idType, options)`       | No auth/ACL check. Only applies status filter if caller supplies a nonempty list. `skipRoutingFilter` bypasses hostname routing. | A public direct lookup can select a draft or omit status entirely. Status must be enforced server-side, independent of requested filters.                                              |
| `journeys`                           | Public list forces `published`                                                                                                   | Avoids drafts on this list, but not ordinary published MCP disclosure or team-template catalog restrictions.                                                                           |
| `Journey` federation entity          | `resolveReference` loads by ID without Read                                                                                      | Must enforce visibility at entity/nested access; only denying a named root tool leaves alternate paths.                                                                                |
| `journeySimpleGet`                   | No auth; helper fetches journey and blocks by ID                                                                                 | Must be gated or excluded at the owning API, not merely hidden from MCP discovery.                                                                                                     |
| `Journey.blocks` and related content | Resolves blocks once parent Journey is returned, without its own Read check                                                      | A bypassed parent exposes graph content. Other nested references and metadata need the same audit.                                                                                     |
| Root `block` and `blocks`            | Auth plus journey ACL or database access predicate                                                                               | Existing protections help, but need grant intersection and current template policy.                                                                                                    |
| Yoga response cache                  | Shared `session: () => null`; named `adminJourney`, `adminJourneys`, `journey`, `journeys`, `block`, `blocks` have TTL zero      | These named roots are not globally cached. This does not prove all entity/compact/delegated operations are safe. `journeySimpleGet` and `_entities` are not explicit zero-TTL entries. |
| Public viewer HTML/Next data         | Static props, ordinarily 60-second revalidation                                                                                  | Private preview must never seed public ISR/CDN caches. Test both HTML and serialized data after warming authorized paths.                                                              |

Sources: [public direct resolver](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journey.query.ts#L15-L92), [public list](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journeys.query.ts#L8-L29), [blocks through Journey](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journey.ts#L72-L110), [entity and compact read](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/journey.ts#L360-L378), [compact helper](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/journey/simple/getSimpleJourney.ts#L11-L28), [block ACL](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/block/block.query.ts#L15-L40), [blocks filter](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/schema/block/blocks.query.ts#L9-L42), [cache configuration](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/src/yoga.ts#L82-L185).

These are source-level exposure paths. The local direct-resolver probe confirms generated Prisma predicates, not a production data disclosure. The gateway's signed-subgraph transport does not by itself supply a missing resource ACL. Deployed gateway reachability, response-cache behavior and entity routing still require the approved staging checks below.

## Smallest concrete handoff work

### Add a human Admin preview route

Proposed new route: `/journeys/{journeyId}/preview`, on the Admin origin. This route does not exist in the inspected code.

1. Reuse the editor route's signed-in account and onboarding checks. Fetch a bounded playback projection through an owning-service Read check using the human's current identity. Do not accept a public URL, arbitrary hostname, query credential or cached payload as proof of authorization.
2. Serve with `Cache-Control: private, no-store`, no public static generation and no shared response caching. Reauthorize every fetch/navigation that loads data. After sign-out or role loss, stop further reads and clear local preview state on the next auth check. Bytes legitimately received before revocation cannot be recalled.
3. Reuse `transformer`, shared `BlockRenderer`, action handling and block history. Extract the viewer's app-local `JourneyRenderer`/`Conductor` and necessary dependencies into shared code, or build a small authenticated playback shell around the same components. The existing editor Canvas is insufficient because it selects Steps and adds editing wrappers instead of mounting playback navigation.
4. Add explicit preview behavior that follows both poll actions and video navigation while suppressing visitor creation, analytics, response submissions, chat/integration calls and external mutation effects. Existing `admin` render mode suppresses the inspected Conductor view-event and RadioQuestion submission paths, but its name alone does not prove every component is side-effect free. Audit video, sign-up, chat and link handlers. Do not launch mail, phone, chat or external URLs automatically during the synthetic playback checks.
5. Provide Restart and Back controls so the creator can traverse Yes, restart at the poll and traverse No. If website mode is supported, keep Step URLs inside the authenticated preview route; current `getNextStepSlug` constructs a public `/{journey.slug}/{step.slug}` address.
6. Point the ordinary draft's Preview control at this route. For MCP-originated preview handoffs of published journeys, use the same authenticated route rather than silently dropping to the public viewer. Keep an explicit Open public page action for published journeys.

The playback mechanism is specific. `RadioOption` calls `handleAction`; `NavigateToBlockAction.blockId` chooses a Step, not its child Card. Funnel playback pushes that Step onto block history. Website mode instead uses a route. `Conductor` seeds the starting Step and tree; it is currently under `apps/journeys`, not already a shared Admin component. [Radio action](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/libs/journeys/ui/src/components/RadioOption/RadioOption.tsx#L33-L43), [action dispatch](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/libs/journeys/ui/src/libs/action/action.ts#L8-L31), [block history](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/libs/journeys/ui/src/libs/block/block.ts#L70-L80), [website route](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/libs/journeys/ui/src/libs/action/getNextStepSlug.ts#L5-L21), [renderer](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/src/components/JourneyRenderer/JourneyRenderer.tsx#L12-L29), [Conductor initialization](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/src/components/Conductor/Conductor.tsx#L58-L83), [view-event guard](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apps/journeys/src/components/Conductor/Conductor.tsx#L132-L153), [poll-event guard](https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx#L108-L125).

### Keep MCP authority separate from human Admin authority

The proposed `journey_preview` tool accepts a journey ID and returns an ordinary authenticated Admin URL, journey ID, current revision, and a bounded route checklist after the owning backend checks both current user Read and the active client grant. The response must say that this is an Admin handoff, not a bearer capability or a completed preview test. Do not send Firebase credentials or the revalidation secret to the model. Do not return a link or metadata for an excluded journey.

Opening that ordinary URL manually starts a human Admin request. The human may still open B in Admin even when the client has only A; a revoked client does not revoke the person's independent Admin role. Conversely, a copied URL grants a stranger nothing. Grant-bound MCP content requests, refreshes and tool retries remain subject to both checks, including after publication. A host must not use the handoff as a way to fetch private content under unrelated ambient browser credentials and call that a delegated read. If a future embedded agent-facing preview serves content itself, it needs a server-side, current-grant check on every load. A user-only Admin session cannot stand in for that check.

This separates the acceptance surfaces. A1 and A2 test MCP link/content acquisition with user plus grant. A8 tests the signed-in human preview, copied-link denials and normal Admin publication. The ordinary public viewer is separately expected to allow published content. Denying an MCP request must not prevent that legitimate public behavior.

### Add ordinary-journey Publish in Admin

Add a visible Draft status and Publish action in the ordinary journey toolbar/menu, enabled only for current Manage authority. A journey-only Editor or Member without ownership sees the draft and preview but no usable Publish action. The action calls the existing `journeyPublish` through the signed-in human session, displays success only after the server confirms the transition, refreshes the editor's status and revision, and refreshes/opens the public viewer. Make a direct API denial part of the test; hiding a button is insufficient. Publication must not be an MCP tool or a side effect of a Share/Preview link.

Retain the backend Manage check, and make publication's state change coordinate with the same journey row/revision serialization used by the proposed MCP edit command. MCP must atomically verify `status === draft` and the expected revision when committing. A read-before-write status check outside the transaction permits a publication race. No current Admin UI action can demonstrate the nonexistent MCP race guard; this remains an implementing-PR gate.

## Evidence ledger

| Evidence                                                                                        | Executed here                                | What it establishes                                                                                                                                                                                              | What it does not establish                                                                         |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Read issues, current source, scoped conventions and glossaries; search ordinary publish callers | Yes                                          | Exact code paths and missing ordinary Publish integration at the pinned revision                                                                                                                                 | Browser rendering, deployed revision or permissions                                                |
| Isolated TypeScript-source probes of `journey.acl`, `journey.query` and `journeyPublish`        | Yes, 13 assertions passed                    | Ordinary role matrix; published team-template Read exception; direct public lookup can omit status or request draft; stranger publish returns FORBIDDEN without a write; owner publish sets published state/date | Pothos auth execution, gateway, real database, transaction races, caches, UI or staging            |
| Existing `journey.acl.spec.ts` through Vitest                                                   | Attempted, setup failed before tests         | Worktree lacks generated Prisma client `libs/prisma/journeys/src/__generated__/client/client`                                                                                                                    | No existing Vitest assertions ran; this is an environment gap, not a demonstrated ACL test failure |
| Approved synthetic staging fixture and signed-in ordinary accounts                              | Not established                              | No staging content was created, published or deleted                                                                                                                                                             | A8 completion                                                                                      |
| Yes and No playback in authenticated draft preview                                              | Not executed; route is missing               | Required implementation/checklist is concrete                                                                                                                                                                    | Existing Preview passing R6                                                                        |
| Ordinary creator clicks Publish                                                                 | Not executed; explicit UI control is missing | Required UI/API integration is identified                                                                                                                                                                        | Successful normal publication                                                                      |
| Signed-out/stranger API, viewer and preview with warm caches                                    | Not executed against deployed services       | Source gaps and required probes identified                                                                                                                                                                       | No draft leak in production/staging                                                                |
| MCP grant/revocation and publication-race tests                                                 | Future; MCP absent                           | Release expectations recorded                                                                                                                                                                                    | Runtime authorization correctness                                                                  |

The attempted existing test command was `pnpm exec vitest run --config apis/api-journeys/vitest.config.mts apis/api-journeys/src/schema/journey/journey.acl.spec.ts --coverage=false`. It exited 1 during Prisma mock setup with zero tests collected. No schema generation or database connection was attempted for this documentation-only investigation.

Local probes transpiled the pinned source with the installed TypeScript compiler and executed it in a VM with explicit enum, builder and Prisma mocks. They captured the resolver supplied to the builder and recorded the Prisma predicate/update. They did not invoke a network endpoint or a real database. An initial probe comparison failed on VM object prototypes; normalizing the assertion input fixed the harness, then all 13 passed. This is supplemental source-execution evidence, not a replacement for existing Vitest or staging integration tests.

## Runnable staging handoff

The remaining research walkthrough concerns today's staging behavior: opening an approved existing draft, observing its Preview redirect/not-found, confirming the absence of an ordinary Publish action, and recording allowed/denied current API behavior. The new authenticated preview, new Publish control and MCP checks below belong to implementing PRs. They cannot pass before those features exist, and they need not block sequencing that implementation. Do not use production records, privileged admin scripts, or someone else's journey as a substitute. No approved fixture/account bundle was available in this investigation; credentials were not inferred or exported.

### Record before starting

- Staging Admin origin, viewer origin and gateway URL; deployed source SHA for each and test time.
- Synthetic team T1 and T2, draft A created by the proposed command and independently prepared draft B; no real personal content, integrations or recipients.
- Accounts O, E, M, N and S. O is A's owner. E is a direct journey Editor with no team membership or publisher role. M is a team Manager. N is a team Member with no direct owner role. S is a signed-in stranger. Also use a fresh signed-out browser context.
- Two clients for O: read/edit A and read-only A; a client grant excluding B even though O can read B. Record grant IDs without credentials.
- A synthetic poll Step P with Card CP, Yes option Y and No option N2. Y's `NavigateToBlockAction.blockId` is video Step V, not V's Card. N2 targets continuation Step C. Store every ID and the starting revision. Use harmless test media and disable real forms/chat/external actions.
- Published global template G, unpublished global template U, team template L, and an ordinary published journey J. Approval must include only these synthetic records' publication or lifecycle tests. Use a separate disposable copy for lifecycle checks.

### Run and attach actual evidence

| Check                       | Action                                                                                                                 | Expected result and evidence to capture                                                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline draft              | O opens Admin `/journeys/A`; inspect persisted status through authorized read                                          | A remains `draft`, owner/team and block IDs match. Capture sanitized response and editor screenshot.                                                                                                                                                  |
| Current Preview diagnostic  | Before replacing the implementation, record Preview link and redirect chain                                            | Existing code is expected to refresh then reach public not-found for a draft. Record observed behavior; do not mark it as private preview success.                                                                                                    |
| New private preview         | O opens the new authenticated route; click Yes, observe V and harmless video playback; Restart, click No, observe C    | Capture starting revision, both resulting Step IDs/screens, and network log showing no visitor, response, analytics, chat or integration writes. Repeat E to prove a direct collaborator works without team membership.                               |
| Denied human preview        | Copy the preview link into signed-out and S contexts, first cold then after O warmed it                                | No draft text, title, graph, image metadata, serialized page data or reusable preview handle. A login/denial page is acceptable; a public redirect with draft content is not. Test logout/role removal then reload.                                   |
| MCP A1 scope                | O's A-only client requests B by ID, slug, outline, block and preview. Repeat with read-only A for an edit              | No B data/link/metadata; no write or queue effect. O manually opening B in Admin remains a separate allowed human action.                                                                                                                             |
| Public API probes           | Send the operations below through staging gateway signed out and as S, with known synthetic IDs                        | Deny draft content across all direct/compact/nested/entity paths. Execute after O's authorized request to expose cache reuse. Preserve GraphQL errors and absence of sensitive data, not just HTTP status.                                            |
| Role removal/cache          | Warm A as E, remove E's direct role via approved fixture management, repeat with previous session/token                | Next API/preview requests denied. Revoke O's first client grant and repeat its MCP calls; the separately authorized read-only client still works until its own authority is removed.                                                                  |
| Catalog A2                  | Run G/U/L/J for each required matrix row via list, direct read and MCP preview                                         | Global published catalog exception only; no team-template nonmember access or ordinary-public-URL MCP access. Repeat membership removal and excluded template grant.                                                                                  |
| Publish refusal             | E and N try normal Publish UI and direct `journeyPublish(id:A)`                                                        | UI unavailable/disabled; backend FORBIDDEN; status, revision, content and queue state unchanged. Ensure neither account has accumulated Manage via another role.                                                                                      |
| Normal publication          | O or M uses the new ordinary Publish action                                                                            | Server returns published, current status/date/revision shown in Admin, public root/custom-domain/step/embed pages open after revalidation. Capture the actual button and response. Do not use GraphQL manually as the successful product walkthrough. |
| Post-publication separation | Fresh visitor opens public J/A. S requests it through MCP; authorized client requests read/preview                     | Public viewer succeeds. S's MCP request fails. Authorized MCP read/preview succeeds. All first-release MCP writes fail.                                                                                                                               |
| Publication race            | Pause an MCP edit after its read but before commit using a deterministic test barrier; publish via Admin; release edit | Backend refuses the edit at commit. Compare content/revision before and after the refusal; no partial blocks/actions or queued effects. Reverse ordering also needs a consistent serialized outcome.                                                  |
| Lifecycle privacy           | On approved never-published synthetic copy only, exercise allowed Archive/Trash/Restore paths                          | Never-published content remains private. Restoring does not silently publish. Already-published control fixture keeps intended public delivery.                                                                                                       |

Example read-only GraphQL probes, substitute only approved synthetic values and use separately configured credentials without putting tokens in artifacts:

```graphql
query DraftById($id: ID!) {
  journey(id: $id, idType: databaseId, options: { skipRoutingFilter: true }) {
    id
    title
    status
    blocks {
      id
      __typename
    }
  }
}
query DraftBySlug($slug: ID!) {
  journey(id: $slug, idType: slug, options: { status: [draft], skipRoutingFilter: true }) {
    id
    title
    blocks {
      id
      __typename
    }
  }
}
query AdminDraft($id: ID!) {
  adminJourney(id: $id, idType: databaseId) {
    id
    title
    status
  }
}
query CompactDraft($id: ID!) {
  journeySimpleGet(id: $id)
}
query DraftBlock($id: ID!) {
  block(id: $id) {
    id
    __typename
  }
}
```

At the approved service-integration test boundary also exercise Journey `_entities` with `{"__typename":"Journey","id":"A"}` and content fields, plus nested block references and related metadata. The public gateway may not expose `_entities` directly; record that routing result and exercise the subgraph through the normal authenticated test transport. Do not bypass production HMAC verification or call an unapproved backend. Repeat omitted status, explicit draft status and empty status list; client-selected filtering must never control visibility.

For the cache cases, record request ordering, identity class, granted resource, response body, cache headers and correlation ID. Test public HTML, Next serialized data, root/domain/embed/step routes, backend response cache and the MCP client's cached results. Removing access must block new data fetches; tests cannot make a person forget content already legitimately displayed.

## Remaining decision and completion condition

The code-based answer is sufficient to scope implementation: add authorized Admin playback, add ordinary Manage-only publication, close alternate draft reads/cache paths, and preserve privacy through draft lifecycle actions. The approved synthetic stage walkthrough remains outstanding. Keep the research ticket open pending review of these source findings and the remaining current-flow staging evidence, or explicitly revise its scope to source research. Track new-feature playback, publication and MCP race checks with their implementing PRs and release gates; do not require unbuilt features to pass before planning them. No acceptance result in this note should be copied as a checked box without actual runtime evidence.

## Appendix: reproduce the 13 local source probes

Save the following as a temporary `.cjs` file outside the checkout. Use the pinned source revision with dependencies installed and run `node /absolute/path/probe.cjs /absolute/path/core`. It deliberately mocks schema registration and Prisma. It verifies source functions and generated database predicates, not framework authorization or persisted records. The test runner prints one PASS line for each assertion and exits nonzero on a failure.

```javascript
const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const root = process.argv[2]
if (!root) throw new Error('Pass the absolute checkout path')
const ts = require(root + '/node_modules/typescript')
const statuses = Object.fromEntries(['draft', 'published', 'archived', 'trashed', 'deleted'].map((x) => [x, x]))
const Action = Object.fromEntries(['Create', 'Read', 'Update', 'Delete', 'Manage', 'Export'].map((x) => [x, x.toLowerCase()]))
function load(path, modules) {
  const source = fs.readFileSync(root + '/' + path, 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(js, {
    exports,
    require(id) {
      if (!(id in modules)) throw new Error('Unmocked import ' + id)
      return modules[id]
    },
    Date
  })
  return exports
}
const prismaModule = { JourneyStatus: statuses, UserJourneyRole: { owner: 'owner', editor: 'editor', inviteRequested: 'inviteRequested' }, UserTeamRole: { manager: 'manager', member: 'member' } }
const acl = load('apis/api-journeys/src/schema/journey/journey.acl.ts', { '@core/prisma/journeys/client': prismaModule, '../../lib/auth/ability': { Action } })
const user = { id: 'synthetic-user' }
let passed = 0
function check(name, actual, expected) {
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected)
  passed++
  console.log('PASS ' + name)
}
const base = { id: 'synthetic-draft', template: false, status: 'draft', teamId: 'synthetic-team', userJourneys: [], team: { userTeams: [] } }
for (const [name, j, expected] of [
  ['owner', { ...base, userJourneys: [{ userId: user.id, role: 'owner' }] }, [true, true, true]],
  ['editor', { ...base, userJourneys: [{ userId: user.id, role: 'editor' }] }, [true, true, false]],
  ['manager', { ...base, team: { userTeams: [{ userId: user.id, role: 'manager' }] } }, [true, true, true]],
  ['member', { ...base, team: { userTeams: [{ userId: user.id, role: 'member' }] } }, [true, true, false]],
  ['stranger', base, [false, false, false]]
])
  check(
    name + ' Read/Update/Manage',
    [Action.Read, Action.Update, Action.Manage].map((a) => acl.journeyAcl(a, j, user)),
    expected
  )
check('published team template currently readable by stranger', acl.journeyAcl(Action.Read, { ...base, template: true, status: 'published' }, user), true)
check('unpublished global template denied stranger', acl.journeyAcl(Action.Read, { ...base, teamId: 'jfp-team', template: true }, user), false)
const registered = {}
const arg = () => ({})
const t = {
  arg,
  prismaField(x) {
    return x
  },
  withAuth() {
    return this
  }
}
const builder = {
  queryField(name, fn) {
    registered[name] = fn(t)
  },
  mutationField(name, fn) {
    registered[name] = fn(t)
  }
}
let lastQuery,
  writeCount = 0
const prisma = {
  journey: {
    findUnique: async (q) => {
      lastQuery = q
      return base
    },
    update: async (q) => {
      writeCount++
      return { ...base, ...q.data }
    }
  }
}
class GraphQLError extends Error {
  constructor(message, opts) {
    super(message)
    this.extensions = opts.extensions
  }
}
load('apis/api-journeys/src/schema/journey/journey.query.ts', { graphql: { GraphQLError }, '@core/prisma/journeys/client': { ...prismaModule, prisma }, '../builder': { builder }, './enums/idType': { IdType: {} }, './inputs': { JourneysQueryOptions: {} }, './journey': { JourneyRef: {} } })
load('apis/api-journeys/src/schema/journey/journeyPublish.mutation.ts', { graphql: { GraphQLError }, '@core/prisma/journeys/client': { ...prismaModule, prisma }, '../builder': { builder }, './journey': { JourneyRef: {} }, './journey.acl': { ...acl, Action } })
;(async () => {
  await registered.journey.resolve({}, null, { id: base.id, idType: 'databaseId', options: { skipRoutingFilter: true } }, { type: 'public' })
  check('public direct lookup has no status or ACL condition', lastQuery.where, { id: base.id })
  await registered.journey.resolve({}, null, { id: 'synthetic-slug', idType: 'slug', options: { status: ['draft'], skipRoutingFilter: true } }, { type: 'public' })
  check('public caller may request draft status', lastQuery.where, { slug: 'synthetic-slug', status: { in: ['draft'] } })
  try {
    await registered.journeyPublish.resolve({}, null, { id: base.id }, { user })
    assert.fail('Expected refusal')
  } catch (e) {
    check('stranger publish forbidden', e.extensions.code, 'FORBIDDEN')
  }
  check('denied publish writes nothing', writeCount, 0)
  prisma.journey.findUnique = async () => ({ ...base, userJourneys: [{ userId: user.id, role: 'owner' }] })
  const result = await registered.journeyPublish.resolve({}, null, { id: base.id }, { user })
  check('owner publish writes published', result.status, 'published')
  check('owner publish sets publishedAt', result.publishedAt instanceof Date, true)
  console.log(passed + ' local source probes passed. Dependencies/database are mocked; no gateway, UI, cache or stage proof.')
})().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
```
