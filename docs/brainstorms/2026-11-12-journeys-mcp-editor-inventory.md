# Journeys MCP editor inventory for the command contract

Read-only inventory, 2026-11-12; checkout `e053db463a141954a6880da642d9fbf1046a8a86`. Scope baseline: [requirements](https://github.com/JesusFilm/core/issues/10157) and [typed contract](https://github.com/JesusFilm/core/issues/10548). This supports [Define the agent commands for updating existing journeys](https://github.com/JesusFilm/core/issues/10535), not an implemented schema. Read it with the [update-only contract](./2026-11-12-journeys-mcp-update-contract.md). Source references are repository-relative at that commit. Shortened `.../` paths refer to the described editor component family; the exact current API declarations and locations are included in the appendix. The appendix gives exact current GraphQL shapes and line numbers, **not an MCP allowlist**. Keep existing-draft-only, no Host writes, no lifecycle/sharing/creation/adoption, and settled media/grant/history policies.

## 1. Mounted families and key distinction

`apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/Properties.tsx:126–188` dispatches properties for Card, Step, Video, Image, Typography, Button, RadioQuestion, RadioOption, Multiselect, MultiselectOption, SignUp, Spacer, TextResponse. Step properties resolve its Card. `.../CanvasDetails/AddBlock/AddBlock.tsx:59–115` mounts creation for Typography, Image, Video, RadioQuestion, Multiselect, TextResponse, Button, Spacer. There is no mounted new SignUp button; the existing SignUp remains editable. GridContainer, GridItem and VideoTrigger exist in API schema but are not mounted controls here; preserve existing data rather than introduce authoring operations just because an API type exists.

**Typography is not an inline rich-text document.** `.../Content/Canvas/InlineEditWrapper/TypographyEdit/TypographyEdit.tsx:22–27,142` edits a plain multiline `content: String`; `libs/journeys/ui/src/components/Typography/Typography.tsx:24–48,63–74` renders that string with newline preservation. There is no rich-text AST, HTML parser or mounted mark toolbar in that path. Current parity means content and whole-block style, not invented bold/italic/list/inline-link commands. #10548's "rich text / supported formatting" should describe actual supported formatting.

## 2. Closed semantic operations and exact editable data

The names below describe the finite operation boundaries for the contract writer; do not expose a generic GraphQL/settings forwarding API. In every case resolve ownership from actual stored resource IDs, not caller parent/journey claims. IDs connecting resources must remain inside the authorized journey unless explicitly an authorized catalog/library/integration resource.

| Gesture family | Current editable fields and important behavior | Evidence |
| --- | --- | --- |
| Set typography | `content:string`; `variant:TypographyVariant`; `align:left/center/right`; current picker writes `settings.color:string` as six-digit hex. Legacy `color:primary/secondary/error` is a fallback for reads, not the current color picker. Mounted variants are **h1,h2,h3,h4,h5,h6,body1,body2,caption**; schema additionally contains subtitle1/subtitle2/overline (preserve old data). No inline formatting marks. | `.../Properties/blocks/Typography/Variant/Variant.tsx:123–203`; `.../Typography/Color/Color.tsx:34–44,69–96,117–139`; `.../Typography/Typography.tsx:50–79`. |
| Set button content/style | `label:string`; `variant:text/contained/outlined`; `size:small/medium/large`; mounted `color:primary/secondary/error`; closed alignment `left/center/right/justify`; start/end icon slot definition. API `settings.color` exists but is not a mounted button color control; preserve it, do not expose a new arbitrary-color setter. `submitEnabled` is created/derived for form semantics, not a mounted independent toggle. Icons are owned child blocks, not arbitrary cross-block references. | `.../AddBlock/NewButtonButton/NewButtonButton.tsx:32–51,75–117`; schema Button inputs/settings. |
| Set button / SignUp icon | Icon `name:IconName|null`, `color:IconColor|null`, `size:IconSize|null` in API; mounted Icon picker selects name (including none) and color. Mounted color choices inherit/primary/secondary/error, while schema also has action/disabled. Do not infer a mounted size control solely from IconSize schema. Existing button owns `startIconId/endIconId`, legacy SignUp owns `submitIconId`. | `.../Properties/controls/Icon/Icon.tsx:58–240,352`; `.../controls/Icon/Color/Color.tsx:79–102`; `.../Properties/blocks/SignUp/SignUp.tsx:37–56`. |
| Set spacer | `spacing:Int`; UI 20–400 in steps of 10; read fallback100. This is an existing UI range, not proof backend enforces it. | `.../Properties/blocks/Spacer/Spacing/Spacing.tsx:18–21,77–79`; `.../Spacer/Spacer.tsx:17`. |
| Add/remove/update poll and options | RadioQuestion `gridView:boolean` (text vs image options); RadioOption `label:string`, action, tracking `eventLabel`, optional image slot. Option image is an Image child plus `pollOptionImageBlockId`; setting/removing/restoring must update both. Option order is parentOrder via reorder gesture. | `.../Properties/blocks/RadioQuestion/RadioQuestion.tsx:22–36,70–92`; `.../RadioOption/RadioOptionImage/RadioOptionImage.tsx:47–101`. |
| Add/remove/update multiselect and options | Multiselect `min:Int|null,max:Int|null`, option `label:string`. Null means limit unset. Limit switch is enabled if either bound nonnull; display defaults min0/maxoptioncount. UI clamps 0≤min≤max≤optioncount; max≥1 while options exist. New multiselect starts with two options. It requires a submit control; create one with icons only if Card has none. Option deletion currently issues an extra parent-max adjustment if max exceeds remaining option count; **it does not also clamp min** in the inspected delete handler. This is a parity/validation defect to resolve in the semantic service, not a reason to copy non-atomic choreography. | `.../Properties/blocks/Multiselect/Multiselect.tsx:47–89,108–148`; `.../AddBlock/NewMultiselectButton/NewMultiselectButton.tsx:43–123,240–287`; `.../Editor/utils/useBlockDeleteCommand/useBlockDeleteCommand.tsx:181–211`. |
| Add/edit text response | `label:string`, `placeholder:string|null`, `hint:string|null`, `required:boolean|null`, `hideLabel:boolean`, `minRows:Int|null`, `type:freeForm/name/email/phone`; selects existing `integrationId:string|null,routeId:string|null` only where allowed. Mounted label/placeholder/hint have UI maxLength250; minRows choices1–4 with null display1. Type change also sets localized default label; changing to a type other than email/name clears integrationId and routeId together. Existing integration selection is GrowthSpaces with accessId on activeTeam; changing integration clears routeId. | `.../TextResponse/TextResponseFields/TextResponseFields.tsx:14–21`; Type.tsx:50–83; MinRows.tsx:73–96; Label.tsx:222; Placeholder.tsx:132; Hint.tsx:126; GrowthSpacesIntegrations/App/App.tsx:54–98. |
| Edit legacy SignUp | `submitLabel:string`, submit icon, action. No new SignUp creation command from its unmounted create API. | `.../Properties/blocks/SignUp/SignUp.tsx:37–56`; `.../Content/Canvas/InlineEditWrapper/SignUpEdit/SignUpEdit.tsx`. |
| Set image media / presentation | Authoring fields `alt:string`, `scale:Int|null` stored percent, `focalLeft:Int|null,focalTop:Int|null` stored percentages. Existing source change provides src, blurhash,width,height together; MCP should derive these from validated catalog/asset/job rather than allow caller-forged backend fetch metadata. Zoom UI1.0–2.0 step0.1 → stored100–200; null displays100. Focal defaults50/50 and writes rounded numbers. Removing image source in ordinary Image keeps block and writes `{src:null,alt:''}`. Image can be content, card cover, poll image, poster, logo, social image: target slot determines owning reference and child structure. | `.../Properties/blocks/Image/Options/ImageOptions.tsx:46–48,52–94,106–119`; `.../Card/BackgroundMedia/Image/ZoomImage/ZoomImage.tsx:17–34,54–56`; FocalPoint/FocalPoint.tsx:59–60,128–148. |
| Set video source | Supported mounted source selection internal catalog/language, YouTube, Mux; API enum also cloudflare. Source-specific identity: internal `videoId,videoVariantLanguageId`; YouTube canonical videoId; Mux media videoId. Derived title/description/image/duration are provider/catalog facts, not general editable metadata. Internal current resolver clears those metadata columns on any internal-source update; YouTube and Mux fetch metadata when videoId changes. YouTube validator is 11-character `^[-\\w]{11}$`; Mux ID nonempty. Internal API validator is nullable and does **not** enforce schema comment's required ID/language; semantic command must distinguish empty video placeholder from selected ready media. | `.../Drawer/VideoBlockEditor/Source`; `apis/api-journeys/src/schema/block/video/videoBlockUpdate.mutation.ts:54–98`; `.../video/service.ts:13–35`. |
| Configure video | `objectFit:fill/fit/zoomed`, `startAt:Int,endAt:Int` seconds, `autoplay:boolean,muted:boolean`, optional poster Image, YouTube `subtitleLanguageId:ID|null`, Mux `showGeneratedSubtitles:boolean|null` and language. UI validates start≤end−3 and end≤known duration. Background video has null parentOrder, always muted/autoplay/no captions; controls locked. First-card muted behavior also constrained by rendering. Mux subtitle toggle writes generated flag and journey-language subtitle ID together, null ID when off. `fullsize` exists in schema but do not expose unless mounted behavior explicitly maps it. | `.../Drawer/VideoBlockEditor/Settings/VideoBlockEditorSettings.tsx:73–94,100–146,182–218,446`; `.../MuxSubtitles/MuxSubtitleSwitch.tsx:64–105`. |
| Set card appearance | `fullscreen:boolean`, `backgroundColor:string|null` includes alpha (no separate persisted opacity), `backdropBlur:Int|null`, `themeMode:light/dark|null`, `themeName:base|null`, cover image/video slot. UI blur percentage0–100 maps to0–25px; default20. Hex alpha picker caps at99% to avoid invalid-color behavior. Theme picker writes mode+base together; absent card theme falls back to journey. Expanded layout disabled when card contains video; video cover rendered contained. Preserve or deliberately normalize according to semantic gesture, never silently delete media on layout edit. | `.../Properties/blocks/Card/Card.tsx:99–145`; CardStyling/CardStyling.tsx:51–74; CardLayout/CardLayout.tsx:57–79; BackgroundColor/BackgroundColor.tsx:154–181,199–211,418–420. |
| Set card AI chat (gated) | UI concepts `enableAiChat:boolean,collapseChat:boolean`; persisted `showAssistant=enableAiChat,expandChatByDefault=!collapseChat`. `expandChatByDefault:null` displays pop-open (not collapse). Current renderer and UI both use strict storedtrue. The Prisma inheritance comment is stale: getFooterElements.ts:55–62 explicitly ignores Journey.showAssistant. Null means off; no new inheritance choice is needed. Gate aiChatEditor. | `libs/journeys/ui/src/libs/aiChatSettings/aiChatSettings.ts:24–64`; `.../Card/Card.tsx:95,149–154,182`; prisma schema:640–643. |

## 3. Action discriminated union, not generic action patch

Mounted actions: None, Navigate to Step, Link, Email, Chat, Phone, SMS. Treat replacement as a whole action value so irrelevant old subtype fields cannot leak through. Current API has separate action mutations plus generic update; the latter is not a suitable MCP surface. `.../Properties/controls/Action/Action.tsx:49–63` removes external action choices on submitEnabled Button, allowing None or Step. `.../Editor/utils/useActionCommand/useActionCommand.ts:78–117` dispatches subtype-specific mutations or delete for None.

- None: remove action, represented by null in current command helper.
- NavigateToBlock: `blockId:string` should resolve to same-journey Step; optional API `gtmEventName:string|null` is tracking, not route identity.
- Link: `url:string`; API target:string|null; mounted useActionCommand currently passes URL/customizable/parentStepId, not target. Avoid claiming new-tab target is a mounted control without separate evidence.
- Email: `email:string`.
- Chat: `chatUrl:string`; API target nullable, same caveat.
- Phone/SMS: `phone:string,countryCode:string,contactAction:call|text` (default call); SMS is contactAction=text, not a separate stored action type.
- API `customizable` and `parentStepId` support template customization. Derive owner step, do not accept foreign parentStepId, and exclude customizable/template-source writes. Template UI toggle `Action.tsx:131–132` is not ordinary draft scope.
- Tracking inputs use fixed `BlockEventLabel` enum; Video also `endEventLabel`. The current UI gate is `journey.template || editJourneyTrackingMetrics`; ordinary draft MCP must enforce the latter/current eligibility. Card, Button, RadioOption, Video expose tracking controls. Keep label assignment separate from visitor analytics reads, which are out of scope.

Exact action inputs/enums appear in appendix. These API definitions include nullable fields and template-only settings; the closed semantic command should choose only the mounted fields above.

## 4. Structural gestures and complete frontend choreography

1. **Add card** is Step + Card, not independent orphan creation. `src/libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation.ts:13–28` has two GraphQL resolver fields with frontend IDs. Source/action/social-preview creation can also wire an edge or reorder start. `.../JourneyFlow/libs/useCreateStepFromStep/useCreateStepFromStep.ts:98–119,210–220` creates Step/Card and updates source nextBlockId; `useCreateStepFromAction.ts:140` similarly creates and connects action; `useCreateStepFromSocialPreview.ts:58,79,102` reorders new Step to start. Own all writes in one semantic transaction.
2. **Reorder within parent / set start** uses blockOrderUpdate and sibling parentOrder. Step parentOrder determines start; this is not a Journey.startId field. `apis/api-journeys/src/schema/block/service.ts:121–152` rewrites sibling orders; null parentOrder (cover media) is not ordinary ordered content. Persist step x/y and social-node x/y for canvas arrangement; viewport selection/zoom remain browser-only. `.../JourneyFlow/JourneyFlow.tsx:157–217` persists step positions plus journey socialNodeX/Y.
3. **Set default continuation** writes Step.nextBlockId; **remove continuation** explicitly nulls it (`.../JourneyFlow/libs/useDeleteEdge/useDeleteEdge.ts:31–52`). Action edges have separate owning action. No automatic blanket routing when adding an ordinary empty card.
4. **Duplicate inside this journey** needs copied descendants, new owned IDs, icon/cover/poster/option references and routes remapped appropriately. Existing `useBlockDuplicateCommand` treats one user action with delete/restore undo; backend blockDuplicate/service are source of graph remapping, not permission to duplicate a whole journey. Preserve the settled separate whole-journey exclusion.
5. **Remove/restore subtree** must preserve sibling order and owner references. Existing delete hook separately clears Journey.menuStepBlockId for menu removal (`useBlockDeleteCommand:215–228`), and separately clamps multiselect max (`181–211`). Settled user-requested delete-only leaves inbound routes unchanged and reports them, so do not copy older broad "repair all routes" suggestions. Undo restores the full recorded before-state, including side effects.
6. **Add button** creates button + two icon child blocks + button start/end reference update (`.../AddBlock/NewButtonButton/NewButtonButton.tsx:32–51`). It detects TextResponse (not Multiselect in this particular NewButton handler) and existing submit button to decide submitEnabled; callers should request ordinary/submit semantics, not manage icon IDs manually.
7. **Add response field** creates only TextResponse if submit already exists; otherwise TextResponse + submit Button + two Icons + reference update. `.../AddBlock/NewTextResponseButton/NewTextResponseButton.tsx:75–131`; `src/libs/useTextResponseWithButtonCreate/useTextResponseWithButtonCreate.ts:26–58,84–119`.
8. **Add multiselect** creates Multiselect + two options, plus submit Button and Icons if needed; its undo/redo deletes/restores both groups. `.../AddBlock/NewMultiselectButton/NewMultiselectButton.tsx:43–123,127–166,240–287`.
9. **Change form type / integration** writes dependent label/destination fields together; see table. Current textResponse resolver checks only that route has an integration (`apis/.../textResponseBlockUpdate.mutation.ts:25–36`), not that the route belongs to an authorized integration/team. This is one existing gap semantic validation must close.
10. **Attach/replace/remove media in a slot** uses image/video create or update plus owning Card.coverBlockId / RadioOption.pollOptionImageBlockId / Video.posterBlockId / Journey.logoImageBlockId / Journey.primaryImageBlockId. Do not let clients sequence the individual mutations. Poster: `.../VideoBlockEditor/Settings/Poster/Library` create+videoRef, clear+delete, restore+ref; Poll image: `RadioOptionImage.tsx:47–101`. Logo: `.../JourneyAppearance/Logo/Logo.tsx:39–47,75–85,134–144`. Social: `.../Drawer/ImageEdit/ImageEdit.tsx:69–85,134`.
11. **Create website menu** is a special complete recipe: Step, Card, heading Typography, subheading Typography, three Buttons, then Journey.menuStepBlockId. `src/libs/useMenuBlockCreateMutation/useMenuBlockCreateMutation.ts:21–68`. Delete/restore also clear/restore owning menu reference. This is within existing draft editing, not whole-journey creation.

## 5. Journey-level editable metadata/appearance

- `title:string,description:string|null,languageId:ID` together in mounted ordinary JourneyDetailsDialog (`.../Toolbar/JourneyDetails/JourneyDetailsDialog/JourneyDetailsDialog.tsx:71–87`). Do not expose every JourneyUpdate field: publisher strategy/tag/template fields, lifecycle, domain/slug sharing, creator metadata, hostId remain excluded.
- Social presentation: `seoTitle:string`, `seoDescription:string`, primary social image slot. Existing UI max49 and179 respectively (`.../Settings/SocialDetails/TitleEdit/TitleEdit.tsx:64–65`, DescriptionEdit:64–65). These are current UI constraints, not new arbitrary MCP quotas.
- Font theme: `headerFont:string,bodyFont:string,labelFont:string`. Create JourneyTheme if absent, update existing theme otherwise (`.../Typography/ThemeBuilderDialog/ThemeBuilderDialog.tsx:127–190`). These are catalog font choices, not arbitrary font URL/import strings. Current display fallback Montserrat. Do not expose arbitrary theme JSON.
- JourneyAppearance mounts WebsiteToggle only under `websiteMode`; website mode shows Logo, DisplayTitle, Menu, Chat; normal journey mode shows Reactions, DisplayTitle, Host, Chat (`.../JourneyAppearance/JourneyAppearance.tsx:62–96`). Host branch is deliberately excluded by agreed scope.
- Website mode `website:boolean`; DisplayTitle `displayTitle:string|null` with current display fallback seoTitle (`.../DisplayTitle/DisplayTitle.tsx:22–53`). Menu `menuButtonIcon:JourneyMenuButtonIcon|null`, owned menu Step reference/recipe. Logo owned Image reference. Do not invent setters for showLogo/showMenu/showHosts/showDisplayTitle/showReactionButtons merely because fields exist in GraphQL if no mounted writer was found.
- Reaction switches write `showShareButton,showLikeButton,showDislikeButton:boolean` (`.../Reactions/Reactions.tsx:17–51,64–77`). The share reaction flag is player presentation, not publishing/domain/access management.
- Chat buttons: create/update/remove per journey; `link:string|null,platform:MessagePlatform|null`. UI has Facebook, WhatsApp, Telegram presets plus custom choice/icon labels and permits no more than two platforms (`.../Chat/Chat.tsx:33–56,98–160`; `.../Chat/ChatOption/Details/Details.tsx:123–136`). Preserve current backend/user eligibility; customizable is template-only. All MessagePlatform enum values in appendix.
- Generic Journey themeMode/themeName are in schema; card theme picker writes card values. Do not treat source schema alone as evidence of a separately mounted journey palette editor. Follow actually mounted control or the explicitly agreed capability.

## 6. Six built-in card starters (recipes, not whole-journey templates)

Base: `.../Editor/Slider/Settings/Drawer/CardTemplates/Layouts`. Existing recipes operate on selected existing Step/Card (empty-card entry in Properties:126–130). Every child/ref/style change is one complete gesture with one snapshot, including restoring prior card properties. Exact localized example copy and sample media IDs can remain server recipe data; do not require agent to copy them or to invent IDs.

| Recipe | Composition / defaults grounded in source | Source lines |
| --- | --- | --- |
| Video | One content Video. Sample internal catalog video language529, start2048/end2058, autoplaytrue/mutedfalse. No route action by default. | CardVideo/CardVideo.tsx:32–36,84–137 |
| Intro | Typography h6 eyebrow, h1 title, body1 paragraph; Button contained with start icon none/endArrowForwardRounded; background Video (isCovertrue). Button actionnull. | CardIntro/CardIntro.tsx:52–99,205–256,390–416 |
| Poll | Cover Image; Typography h6 eyebrow+h2 title; RadioQuestion with four RadioOptions; caption closing copy; fullscreentrue, dark/base. Options have actionnull, not mandatory invented routes. | CardPoll/CardPoll.tsx:54–104,240–338,366,444 |
| Form | Cover Image; Typography h6 eyebrow+h1 title; TextResponse (sample "My Prayer:"); submit Button + two Icons; caption; fullscreentrue,dark/base. | CardForm/CardForm.tsx:63–116,274–355,380–456 |
| Quote | Cover Image; Typography h6 eyebrow+h3 quote+body1 attribution; background#0E1412,dark/base,fullscreenfalse. | CardQuote/CardQuote.tsx:48–73,185–251 |
| CTA | Cover Image; h6 eyebrow+h3 title; three Buttons each with two icon children. "Chat with us" containedlarge/startChatBubbleOutlineRounded; "Email us" containedlarge/startSendRounded; "More about us" textsecondarylarge/startArrowForwardRounded. All actionnull. background#0E1412,dark/base,fullscreenfalse. | CardCta/CardCta.tsx:58–150,322–468,496–596 |

## 7. Null, omission, replacement and backend pitfalls to make explicit

- GraphQL optional nullable inputs do not mean every field should allow null in MCP. Omission means keep existing; define a distinct explicit clear/reset only for meaningful nullable values. Required rendered text can use empty string if current editor permits. Whole-object action replacement must not be confused with field omission.
- Current Button and Typography updates merge only provided nonnull settings into existing JSON; `settings:null` is ignored. A nested `color:null` can overwrite a key. Preserve unrelated legacy JSON internally, but reject unknown public keys. `apis/.../button/buttonBlockUpdate.mutation.ts:61–69`, typography/typographyBlockUpdate.mutation.ts:25–33.
- Current image transform **resets width,height,blurhash to0,0,'' whenever the input lacks all three**, even for a focal-only update, unless src present then it fetches/decodes src. `apis/.../image/transformInput.ts:15–43`. This is concrete reason not to implement command by forwarding arbitrary sparse ImageBlockUpdateInput. Service should operate from resolved trusted asset/current state and preserve media metadata appropriately.
- Source-change metadata and `isCover` are ownership/lifecycle details of media attachment. Internal video update clears provider metadata columns; notes emptystring→null is template publisher behavior, excluded. Read derived media description/duration safely; do not add generic setters.
- Clearing link, poster, cover, logo, poll image is not one universal block deletion: ordinary Image "remove image" keeps block and srcnull; owner slots often clear ref and softdelete owned child. Preserve exact slot semantics and media-library asset retention. Removing editor reference does not delete successful provider asset under settled policy.
- Current Prisma update helper uses one transaction per resolver (`apis/.../block/service.ts:167–195`), so a GraphQL document with several mutation fields is not evidence of atomic gesture. The MCP owning-service command must gather these resolver effects in one transaction and record operation receipt/history with the committed batch.
- Empty action/new card/media placeholder is current ordinary draft behavior. The recipes themselves create null actions. Do not silently adopt old proposal assertions that every new poll option must already route or every card must be reachable; those are authoring guidance/warnings unless explicitly required by current product validation.
- UI feature gates are not backend entitlements. Required server mapping: websiteMode, aiChatEditor, editJourneyTrackingMetrics; template-only customizableMedia/customizable/notes remain excluded. Existing authorized media-history/asset selection follows prior policy; no new generation opt-in or role.

## 8. Bounded remaining verification before executable schemas

This inventory is enough to replace the old narrow proposal and enumerate closed command families, but it is not a claim every field is already backend-validated. The implementation/spec needs per-command persisted before/after examples and authoritative validation for: allowable block parent/slot types; same-journey descendant/remapping behavior; integration route membership; supported resource metadata; UI-only ranges; action URL schemes; stale AI chat schema documentation versus verified current renderer; all current Admin mutation participation in revision fences. Source read found no need to ask for another product tier or reopen settled features. API-only fields and richer formatting should not be added by inference.

The exact current API inputs/enums below retain schema comments so reviewers can compare them to the narrower mounted inventory. IDs/defaults/nullability are factual; they are not permission grants.


## 9. Final checks: option deletion, clone behavior, exact finite command fields

**Last-option deletion:** allowed for both poll types. `.../Content/Canvas/SelectableWrapper/SelectableWrapper.tsx:140–141,192` wraps RadioOption and MultiselectOption in QuickControls; `.../QuickControls/QuickControls.tsx:69` supplies no delete-disable condition; `.../QuickControls/DeleteBlock/DeleteBlock.tsx:35` disables only missing selection or explicit disabled. `useBlockDeleteCommand.tsx:81–88` and backend `apis/.../block/blockDelete.mutation.ts:33–54` have no minimum-option guard. Do not add an unapproved "must keep one/two options" product rule.

**Existing count UI:** Add option is hidden at12 children for RadioQuestion (`InlineEditWrapper/RadioQuestionEdit/RadioQuestionEdit.tsx:66–84`) and Multiselect (`MultiselectEdit/MultiselectEdit.tsx:114`). This is not evidence of a universal enforced server maximum: generic duplicate remains available. Distinguish preserving existing Add-option behavior from introducing a global maximum.

**Multiselect normalization:** settings blur orders two provided numbers, clamps min0..N and max1..N when N>0 (0 when N=0), then min≤max; disabling clears both to null. `.../Properties/blocks/Multiselect/Multiselect.tsx:151–183,245–266,293–295`. Deletion currently clamps only nonnull max to N; therefore min>N can remain. Safe semantic correction without a new product choice: after an explicitly requested option deletion, normalize any nonnull min/max against the remaining count in the same transaction and include both in history/effect summary; preserve null (unlimited) fields. Zero options are allowed, so finite bounds normalize to0 at N=0 rather than refusing deletion. Capture original bounds for undo; do not rely on current delete hook undo to reconstruct them.

**Clone detail:** existing backend deliberately clears copied Step.nextBlockId (`apis/.../block/service.ts:240–241`), remaps child BlockId/IconId refs (`242–246`), copies the action payload (`248–250`), and changes duplicated standalone submit Button to non-submit (`253–257`, keeps submit when duplicating whole Step). It does not promise automatic remapping of action destinations to arbitrary newly duplicated sibling Steps. The contract must state these concrete within-journey semantics instead of saying "fix routes appropriately."

**AI-chat read/write:** `libs/journeys/ui/src/components/Card/utils/getFooterElements/getFooterElements.ts:55–62` says card-only; admin/embed do not render the AI chat button and default runtime only renders storedtrue. Use `toAiChatSettings` for effective read `{enableAiChat: card.showAssistant===true, collapseChat: card.expandChatByDefault===false}`; use `toCardBlockAiChatInput` for explicit paired writes. Preserve raw nullable before-state for undo. Do not add a journey inheritance command. Effective DisplayTitle also has important distinction: null→seoTitle fallback; emptystring→no title (`getFooterElements.ts:65–71`).

**Website card slug:** mounted `.../Content/Canvas/CardSlugEdit/CardSlugEdit.tsx:43–62` writes Step.slug; emptystring→null and reports uniqueness errors. This differs from excluded whole-Journey share slug. Step.locked is present in API/default objects but no mounted editing control was found.

### Suggested finite registry for the spec writer (operation names are draft terminology)

All objects reject extra properties; ordinary patch keys may be omitted to retain state. This list intentionally does **not** inherit arbitrary fields from the GraphQL appendix. Existing envelope provides journeyId/revision/idempotency; reference IDs below are validated against actual ownership. The semantic operations below can be separate MCP tools or a closed discriminated union; this inventory does not choose transport packaging.

| Named semantic operation | Finite public payload fields |
| --- | --- |
| updateJourneyDetails | title:string?, description:string?, languageId:ID? |
| setSocialText | seoTitle:string?, seoDescription:string? |
| setDisplayTitle | displayTitle:string|null (empty hides; null resets fallback) |
| setJourneyFonts | headerFont:catalog-font-name, bodyFont:catalog-font-name, labelFont:catalog-font-name; service creates theme if absent |
| setWebsiteMode | enabled:boolean (maps website, gated) |
| setReactions | share:boolean?, like:boolean?, dislike:boolean? (maps three show*Button fields) |
| addChatButton / updateChatButton / removeChatButton | add:platform:MessagePlatform,link:string; update:chatButtonId,platform?,link?; remove:chatButtonId. No customizable. |
| createMenu / removeMenu / setMenuIcon | create:server-owned menu recipe (optional placement x/y if exposed by current layout command); remove:no caller-supplied foreign menu ID, resolve current journey menu; icon:JourneyMenuButtonIcon|null |
| addCard | placement: x:Int?,y:Int?; optional insertion predecessor/start intent; optional source continuation/action target as an explicit discriminated connector intent. Service allocates Step+Card IDs and relationships. No journey creation. |
| duplicateCard / duplicateContent | sourceStepId or sourceBlockId; optional sibling insertion index and step x/y. Server allocates/remaps owned IDs; no caller idMap. Current standalone Video duplication is disabled in QuickControls:68. |
| deleteCard / deleteContent / restoreRecordedRemoval | stepId or blockId; delete semantics fixed to agreed delete-only unless explicit requested routing operation also in batch; restore uses authorized durable operation/history record, not arbitrary deletedAt setter |
| reorderContent / reorderCards / setStartCard | closed existing owned ID ordering (or targetId+newIndex); start:stepId. No arbitrary parentBlockId patch. |
| setStepContinuation | stepId,nextStepId:ID|null |
| setCanvasPositions / arrangeCanvas | explicit owned stepId→x/y pairs and optional social x/y; arrange has no arbitrary graph payload. Coordinates persist, viewport does not. |
| setCardSlug | stepId,slug:string|null |
| setCardAppearance | cardId,fullscreen:boolean?,themeMode:light|dark?,backgroundColor:validated hex-with-optional-alpha|null?,backdropBlur:Int|null?; derive themeName=base when theme selector changes. No arbitrary settings map. |
| setCardAiChat | cardId,enableAiChat:boolean,collapseChat:boolean (gated); maps both legacy fields explicitly |
| addTypography / updateTypography | cardId for add or typographyId for update; content:string?,variant:mounted nine-value subset?,align:left|center|right?,textColor:validated-six-digit-hex?; existing legacy enum/variant values preserved when omitted |
| addButton / updateButton | cardId for add or buttonId for update; label:string?,variant:text|contained|outlined?,color:primary|secondary|error?,size:small|medium|large?,alignment:left|center|right|justify?; creation derives submit role from complete form gesture. No independent submitEnabled/foreign icon ID fields. |
| setButtonIcon / setLegacySignUpIcon | owning buttonId+slot:start|end or signUpId; iconName:mounted IconName|null,color:inherit|primary|secondary|error?; service owns child creation/reference. Hidden legacy names LiveTvRounded,LockOpenRounded,RadioButtonUncheckedRounded remain read-preserved, not newly offered; no size control found. |
| addSpacer / updateSpacer | cardId or spacerId; spacing:Int |
| addPoll / setPollLayout | cardId with initial option descriptors; existing radioQuestionId,gridView:boolean. Options are child label/action/media descriptors, not raw children. |
| addPollOption / updatePollOption / removePollOption / reorderPollOptions | questionId+label:string for add; optionId+label for update; optionId remove; owned option ordering. Action/image/tracking use named operations below. |
| addMultiselect / setSelectionLimits | cardId plus initial option labels; multiselectId,min:Int|null,max:Int|null (normalization/invariants above). Complete add includes shared submit control if absent. |
| addMultiselectOption / updateMultiselectOption / removeMultiselectOption / reorderMultiselectOptions | multiselectId+label for add; optionId+label update; optionId removal plus bound normalization; owned option ordering |
| addTextResponse / updateTextResponse | cardId or responseId; label:string?,placeholder:string?,hint:string?,required:boolean?,hideLabel:boolean?,minRows:1|2|3|4?; complete add supplies submit control if absent |
| setTextResponseType | responseId,type:freeForm|name|email|phone; map localized label and clear destination if ineligible as current UI gesture |
| setResponseDestination | responseId, integrationId:authorized-existing-ID|null, routeId:authorized-route-ID|null; changing integration clears prior route unless explicit matching replacement included; only name/email eligibility, no credentials or event delivery |
| editLegacySignUp | signUpId,submitLabel:string; icon/action separate named operations, no create |
| setAction | ownerBlockId, action:{kind:none}|{kind:step,stepId}|{kind:link,url}|{kind:email,email}|{kind:chat,chatUrl}|{kind:phone,phone,countryCode}|{kind:sms,phone,countryCode}; derive owning Step. No arbitrary target/gtm/customizable/parentStep fields. |
| setTrackingLabel | eligible blockId,eventLabel:BlockEventLabel|null; Video also endEventLabel:BlockEventLabel|null; enforce existing tracking flag |
| addImage / attachImageToSlot / clearImageSlot | cardId content or explicit owning slot discriminator (contentImage,cardCover,pollOptionImage,videoPoster,journeyLogo,socialImage) + validated catalog/library/job asset ref; optional alt:string. No raw src,width,height,blurhash or arbitrary owning ref. |
| setImagePresentation | imageId,alt:string?,scale:Int?,focalLeft:Int?,focalTop:Int?; preserve trusted asset metadata |
| addVideo / selectVideoSource / clearVideoSource | cardId or owned video slot + closed source union:internal{videoId,languageId},youtube{videoId},mux{authorizedAssetId}; empty placeholder allowed where existing AddVideo gesture supports it. Ready media job attachment remains separate authorized action per settled policy. |
| setVideoPlayback | videoId,startAt:Int?,endAt:Int?,objectFit:fill|fit|zoomed?,autoplay:boolean?,muted:boolean?; validate source/duration/background/first-card rules |
| setYouTubeSubtitles / setMuxSubtitles | owned videoId, subtitleLanguageId:available-ID|null; or enabled:boolean (derive journey language/clear ID). No caller provider dispatch settings. |
| applyCardStarter | existing empty cardId,starter:Video|Intro|Poll|Form|Quote|CTA; optional finite content overrides must be explicitly defined per recipe, not arbitrary settings/children. Initial recipe can use source-owned localized defaults. |
| undo / redo | authorized retained batch identifier or current history head per settled contract; uses captured before/after state rather than arbitrary inverse mutation input |

The finite registry deliberately leaves upload/generation job envelopes, preview/read shapes, consent/revisions and history fencing to their already-settled contracts. It adds no generation entitlement or background auto-attachment. It includes fields only supported by mounted ordinary controls; GraphQL-only settings remain internal/preserved.


## Appendix: current schema shapes (API superset, not MCP allowlist)

### BlockDuplicateIdMap ; `apis/api-journeys/schema.graphql:17`

```graphql
input BlockDuplicateIdMap {
  oldId: ID!
  newId: ID!
}
```

### BlockEventLabel ; `apis/api-journeys/schema.graphql:22`

```graphql
enum BlockEventLabel {
  custom1
  custom2
  custom3
  decisionForChrist
  gospelPresentationStart
  gospelPresentationComplete
  inviteFriend
  prayerRequest
  rsvp
  share
  specialVideoStart
  specialVideoComplete
}
```

### ButtonAlignment ; `apis/api-journeys/schema.graphql:68`

```graphql
enum ButtonAlignment {
  left
  center
  right
  justify
}
```

### ButtonBlockCreateInput ; `apis/api-journeys/schema.graphql:94`

```graphql
input ButtonBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  eventLabel: BlockEventLabel
  label: String!
  variant: ButtonVariant
  color: ButtonColor
  size: ButtonSize
  submitEnabled: Boolean
  settings: ButtonBlockSettingsInput
}
```

### ButtonBlockSettingsInput ; `apis/api-journeys/schema.graphql:117`

```graphql
input ButtonBlockSettingsInput {
  alignment: ButtonAlignment
  color: String
}
```

### ButtonBlockUpdateInput ; `apis/api-journeys/schema.graphql:122`

```graphql
input ButtonBlockUpdateInput {
  parentBlockId: ID
  eventLabel: BlockEventLabel
  label: String
  variant: ButtonVariant
  color: ButtonColor
  size: ButtonSize
  startIconId: ID
  endIconId: ID
  submitEnabled: Boolean
  settings: ButtonBlockSettingsInput
}
```

### ButtonColor ; `apis/api-journeys/schema.graphql:174`

```graphql
enum ButtonColor {
  primary
  secondary
  error
  inherit
}
```

### ButtonSize ; `apis/api-journeys/schema.graphql:181`

```graphql
enum ButtonSize {
  small
  medium
  large
}
```

### ButtonVariant ; `apis/api-journeys/schema.graphql:187`

```graphql
enum ButtonVariant {
  text
  contained
  outlined
}
```

### CardBlockCreateInput ; `apis/api-journeys/schema.graphql:3073`

```graphql
input CardBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  eventLabel: BlockEventLabel
  backgroundColor: String
  backdropBlur: Int
  fullscreen: Boolean
  themeMode: ThemeMode
  themeName: ThemeName
}
```

### CardBlockUpdateInput ; `apis/api-journeys/schema.graphql:3085`

```graphql
input CardBlockUpdateInput {
  parentBlockId: ID
  eventLabel: BlockEventLabel
  coverBlockId: ID
  backgroundColor: String
  backdropBlur: Int
  fullscreen: Boolean
  themeMode: ThemeMode
  themeName: ThemeName
  showAssistant: Boolean
  expandChatByDefault: Boolean
}
```

### ChatActionInput ; `apis/api-journeys/schema.graphql:3110`

```graphql
input ChatActionInput {
  gtmEventName: String
  chatUrl: String!
  target: String
  customizable: Boolean
  parentStepId: String
}
```

### ChatButtonCreateInput ; `apis/api-journeys/schema.graphql:3127`

```graphql
input ChatButtonCreateInput {
  link: String
  platform: MessagePlatform
}
```

### ChatButtonUpdateInput ; `apis/api-journeys/schema.graphql:3132`

```graphql
input ChatButtonUpdateInput {
  link: String
  platform: MessagePlatform
  customizable: Boolean
}
```

### ContactActionType ; `apis/api-journeys/schema.graphql:3163`

```graphql
enum ContactActionType {
  call
  text
}
```

### EmailActionInput ; `apis/api-journeys/schema.graphql:3285`

```graphql
input EmailActionInput {
  gtmEventName: String
  email: String!
  customizable: Boolean
  parentStepId: String
}
```

### IconBlockCreateInput ; `apis/api-journeys/schema.graphql:3431`

```graphql
input IconBlockCreateInput {
  """
  ID should be unique Response UUID (Provided for optimistic mutation result matching)
  """
  id: ID
  parentBlockId: ID!
  journeyId: ID!
  name: IconName
  color: IconColor
  size: IconSize
}
```

### IconBlockUpdateInput ; `apis/api-journeys/schema.graphql:3443`

```graphql
input IconBlockUpdateInput {
  name: IconName
  color: IconColor
  size: IconSize
}
```

### IconColor ; `apis/api-journeys/schema.graphql:3449`

```graphql
enum IconColor {
  primary
  secondary
  action
  error
  disabled
  inherit
}
```

### IconName ; `apis/api-journeys/schema.graphql:3458`

```graphql
enum IconName {
  PlayArrowRounded
  TranslateRounded
  CheckCircleRounded
  RadioButtonUncheckedRounded
  FormatQuoteRounded
  LockOpenRounded
  ArrowForwardRounded
  ArrowBackRounded
  ChatBubbleOutlineRounded
  LiveTvRounded
  MenuBookRounded
  ChevronRightRounded
  ChevronLeftRounded
  BeenhereRounded
  SendRounded
  SubscriptionsRounded
  ContactSupportRounded
  Launch
  MailOutline
  ArrowLeftContained2
  ArrowRightContained2
  MessageChat1
  Home4
  LinkAngled
  Volume5
  Note2
  UserProfile2
  UsersProfiles3
  Phone
}
```

### IconSize ; `apis/api-journeys/schema.graphql:3490`

```graphql
enum IconSize {
  sm
  md
  lg
  xl
  inherit
}
```

### ImageBlockCreateInput ; `apis/api-journeys/schema.graphql:3527`

```graphql
input ImageBlockCreateInput {
  """
  ID should be unique Response UUID (Provided for optimistic mutation result matching)
  """
  id: ID
  parentBlockId: ID
  journeyId: ID!
  src: String
  alt: String!

  """
  If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated.
  """
  blurhash: String
  width: Int
  height: Int

  """
  True if the coverBlockId in a parent block should be set to this block's id.
  """
  isCover: Boolean
  scale: Int
  focalTop: Int
  focalLeft: Int
  customizable: Boolean
}
```

### ImageBlockUpdateInput ; `apis/api-journeys/schema.graphql:3554`

```graphql
input ImageBlockUpdateInput {
  parentBlockId: ID
  src: String
  alt: String

  """
  If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated.
  """
  blurhash: String
  width: Int
  height: Int
  isCover: Boolean
  scale: Int
  focalTop: Int
  focalLeft: Int
  customizable: Boolean
}
```

### JourneyMenuButtonIcon ; `apis/api-journeys/schema.graphql:3880`

```graphql
enum JourneyMenuButtonIcon {
  menu1
  equals
  home3
  home4
  more
  ellipsis
  grid1
  chevronDown
}
```

### JourneyThemeCreateInput ; `apis/api-journeys/schema.graphql:3953`

```graphql
input JourneyThemeCreateInput {
  journeyId: ID!
  bodyFont: String
  headerFont: String
  labelFont: String
}
```

### JourneyThemeUpdateInput ; `apis/api-journeys/schema.graphql:3960`

```graphql
input JourneyThemeUpdateInput {
  bodyFont: String
  headerFont: String
  labelFont: String
}
```

### JourneyUpdateInput ; `apis/api-journeys/schema.graphql:3966`

```graphql
input JourneyUpdateInput {
  title: String
  languageId: String
  themeMode: ThemeMode
  themeName: ThemeName
  description: String
  creatorDescription: String
  creatorImageBlockId: ID
  primaryImageBlockId: ID
  slug: String
  seoTitle: String
  seoDescription: String
  hostId: String
  strategySlug: String
  tagIds: [ID!]
  website: Boolean
  showShareButton: Boolean
  showLikeButton: Boolean
  showDislikeButton: Boolean
  displayTitle: String
  showHosts: Boolean
  showChatButtons: Boolean
  showReactionButtons: Boolean
  showLogo: Boolean
  showMenu: Boolean
  showDisplayTitle: Boolean
  showAssistant: Boolean
  menuButtonIcon: JourneyMenuButtonIcon
  menuStepBlockId: ID
  logoImageBlockId: ID
  socialNodeX: Int
  socialNodeY: Int
}
```

### LinkActionInput ; `apis/api-journeys/schema.graphql:4187`

```graphql
input LinkActionInput {
  gtmEventName: String
  url: String!
  target: String
  customizable: Boolean
  parentStepId: String
}
```

### MessagePlatform ; `apis/api-journeys/schema.graphql:4197`

```graphql
enum MessagePlatform {
  facebook
  telegram
  whatsApp
  instagram
  kakaoTalk
  viber
  vk
  snapchat
  skype
  line
  tikTok
  custom
  globe2
  globe3
  messageText1
  messageText2
  send1
  send2
  messageChat2
  messageCircle
  messageNotifyCircle
  messageNotifySquare
  messageSquare
  mail1
  linkExternal
  home3
  home4
  helpCircleContained
  helpSquareContained
  shieldCheck
  menu1
  checkBroken
  checkContained
  settings
  discord
  signal
  weChat
}
```

### MultiselectBlockCreateInput ; `apis/api-journeys/schema.graphql:4248`

```graphql
input MultiselectBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
}
```

### MultiselectBlockUpdateInput ; `apis/api-journeys/schema.graphql:4254`

```graphql
input MultiselectBlockUpdateInput {
  parentBlockId: ID
  min: Int
  max: Int
}
```

### MultiselectOptionBlockCreateInput ; `apis/api-journeys/schema.graphql:4270`

```graphql
input MultiselectOptionBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  label: String!
}
```

### MultiselectOptionBlockUpdateInput ; `apis/api-journeys/schema.graphql:4277`

```graphql
input MultiselectOptionBlockUpdateInput {
  parentBlockId: ID
  label: String
}
```

### NavigateToBlockActionInput ; `apis/api-journeys/schema.graphql:5658`

```graphql
input NavigateToBlockActionInput {
  gtmEventName: String
  blockId: String!
}
```

### PhoneActionInput ; `apis/api-journeys/schema.graphql:5696`

```graphql
input PhoneActionInput {
  gtmEventName: String
  phone: String!
  countryCode: String!
  contactAction: ContactActionType = call
  customizable: Boolean
  parentStepId: String
}
```

### RadioOptionBlockCreateInput ; `apis/api-journeys/schema.graphql:6221`

```graphql
input RadioOptionBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  eventLabel: BlockEventLabel
  label: String!
}
```

### RadioOptionBlockUpdateInput ; `apis/api-journeys/schema.graphql:6229`

```graphql
input RadioOptionBlockUpdateInput {
  parentBlockId: ID
  eventLabel: BlockEventLabel
  label: String
  pollOptionImageBlockId: ID
}
```

### RadioQuestionBlockCreateInput ; `apis/api-journeys/schema.graphql:6246`

```graphql
input RadioQuestionBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
}
```

### SignUpBlockUpdateInput ; `apis/api-journeys/schema.graphql:6301`

```graphql
input SignUpBlockUpdateInput {
  parentBlockId: ID
  submitIconId: ID
  submitLabel: String
}
```

### SpacerBlockCreateInput ; `apis/api-journeys/schema.graphql:6336`

```graphql
input SpacerBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  spacing: Int
}
```

### SpacerBlockUpdateInput ; `apis/api-journeys/schema.graphql:6343`

```graphql
input SpacerBlockUpdateInput {
  parentBlockId: ID
  spacing: Int
}
```

### StepBlockCreateInput ; `apis/api-journeys/schema.graphql:6390`

```graphql
input StepBlockCreateInput {
  id: ID
  journeyId: ID!
  nextBlockId: ID
  locked: Boolean

  """
  x is used to position the block horizontally in the journey flow diagram on the editor.
  """
  x: Int

  """
  y is used to position the block vertically in the journey flow diagram on the editor.
  """
  y: Int
}
```

### StepBlockPositionUpdateInput ; `apis/api-journeys/schema.graphql:6407`

```graphql
input StepBlockPositionUpdateInput {
  id: ID!
  x: Int
  y: Int
}
```

### StepBlockUpdateInput ; `apis/api-journeys/schema.graphql:6413`

```graphql
input StepBlockUpdateInput {
  nextBlockId: ID
  locked: Boolean

  """
  x is used to position the block horizontally in the journey flow diagram on the editor.
  """
  x: Int

  """
  y is used to position the block vertically in the journey flow diagram on the editor.
  """
  y: Int

  """
  Slug should be unique amongst all blocks (server will throw BAD_USER_INPUT error if not). If not required will use the current block id. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness
  """
  slug: String
}
```

### TextResponseBlockCreateInput ; `apis/api-journeys/schema.graphql:6914`

```graphql
input TextResponseBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  label: String!
}
```

### TextResponseBlockUpdateInput ; `apis/api-journeys/schema.graphql:6921`

```graphql
input TextResponseBlockUpdateInput {
  parentBlockId: ID
  label: String
  placeholder: String
  required: Boolean
  hint: String
  hideLabel: Boolean
  minRows: Int
  routeId: String
  type: TextResponseType
  integrationId: String
}
```

### TextResponseType ; `apis/api-journeys/schema.graphql:6953`

```graphql
enum TextResponseType {
  freeForm
  name
  email
  phone
}
```

### ThemeMode ; `apis/api-journeys/schema.graphql:6960`

```graphql
enum ThemeMode {
  dark
  light
}
```

### ThemeName ; `apis/api-journeys/schema.graphql:6965`

```graphql
enum ThemeName {
  base
}
```

### TypographyAlign ; `apis/api-journeys/schema.graphql:6979`

```graphql
enum TypographyAlign {
  left
  center
  right
}
```

### TypographyBlockCreateInput ; `apis/api-journeys/schema.graphql:6999`

```graphql
input TypographyBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  content: String!
  variant: TypographyVariant
  color: TypographyColor
  align: TypographyAlign
  settings: TypographyBlockSettingsInput
}
```

### TypographyBlockSettingsInput ; `apis/api-journeys/schema.graphql:7017`

```graphql
input TypographyBlockSettingsInput {
  color: String
}
```

### TypographyBlockUpdateInput ; `apis/api-journeys/schema.graphql:7021`

```graphql
input TypographyBlockUpdateInput {
  parentBlockId: ID
  content: String
  variant: TypographyVariant
  color: TypographyColor
  align: TypographyAlign
  settings: TypographyBlockSettingsInput
}
```

### TypographyColor ; `apis/api-journeys/schema.graphql:7030`

```graphql
enum TypographyColor {
  primary
  secondary
  error
}
```

### TypographyVariant ; `apis/api-journeys/schema.graphql:7036`

```graphql
enum TypographyVariant {
  h1
  h2
  h3
  h4
  h5
  h6
  subtitle1
  subtitle2
  body1
  body2
  caption
  overline
}
```

### VideoBlockCreateInput ; `apis/api-journeys/schema.graphql:7225`

```graphql
input VideoBlockCreateInput {
  id: ID
  journeyId: ID!
  parentBlockId: ID!
  eventLabel: BlockEventLabel
  endEventLabel: BlockEventLabel
  videoId: ID
  videoVariantLanguageId: ID
  source: VideoBlockSource

  """
  True if the coverBlockId in a parent block should be set to this block's id.
  """
  isCover: Boolean
  title: String
  description: String
  image: String
  duration: Int
  objectFit: VideoBlockObjectFit
  startAt: Int
  endAt: Int
  muted: Boolean
  autoplay: Boolean
  fullsize: Boolean
  posterBlockId: ID
  subtitleLanguageId: ID
  showGeneratedSubtitles: Boolean
  customizable: Boolean

  """Publisher notes for template adapters (e.g. trailer, intro)."""
  notes: String
}
```

### VideoBlockObjectFit ; `apis/api-journeys/schema.graphql:7258`

```graphql
enum VideoBlockObjectFit {
  fill
  fit
  zoomed
}
```

### VideoBlockSource ; `apis/api-journeys/schema.graphql:7264`

```graphql
enum VideoBlockSource {
  cloudflare
  internal
  youTube
  mux
}
```

### VideoBlockUpdateInput ; `apis/api-journeys/schema.graphql:7271`

```graphql
input VideoBlockUpdateInput {
  parentBlockId: ID
  eventLabel: BlockEventLabel
  endEventLabel: BlockEventLabel
  videoId: ID
  videoVariantLanguageId: ID
  posterBlockId: ID
  title: String
  description: String
  image: String
  duration: Int
  objectFit: VideoBlockObjectFit
  startAt: Int
  endAt: Int
  muted: Boolean
  autoplay: Boolean
  fullsize: Boolean
  subtitleLanguageId: ID

  """
  internal source: videoId and videoVariantLanguageId required
    youTube source: videoId required
  """
  source: VideoBlockSource
  showGeneratedSubtitles: Boolean
  customizable: Boolean

  """
  Publisher notes for template adapters (e.g. trailer, intro). Pass an empty string to clear.
  """
  notes: String
}
```

All requested schema names found.
