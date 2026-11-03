import { z } from 'zod'

import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { JOURNEY_DEFAULTS } from '../journeyDefaults'
import {
  type Journey,
  journeyForModel,
  journeyInputSchema
} from '../journeySchema'
import { mediaJourney } from '../journeySchema/examples'
import { LIBRARY_VIDEOS } from '../libraryVideos/catalog'

import type { Plan } from './stageSchemas'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** What every stage may read. The journey is the memory; chat is context. */
export interface StageContext {
  summary: string
  /** The last 10 messages before the current one, oldest first. */
  messages: ChatMessage[]
  journey: Journey | null
  pendingPlan: Plan | null
}

const PRODUCT = `You help people build NextSteps journeys. A journey is a short series of full-screen cards that someone taps through on their phone, used by churches and ministries to share the gospel and invite a response. Each step holds one card.`

const DEFAULT_OPTIONS = `Authoring defaults: use ${JOURNEY_DEFAULTS.theme} mode for new cards and objectFit ${JOURNEY_DEFAULTS.videoObjectFit} for both backgroundVideo and standalone video blocks. Explicit user requests override defaults. Preserve existing settings on unrelated edits; defaults are not permission to restyle existing content. Use Fit when explicitly asked to show the whole frame or avoid cropping, and respect native source restrictions such as YouTube's fixed Fit. Prefer h2 titles, body2 text, and no spacers unless requested or necessary.`

const EDIT_TARGETING = `Edit targeting:
- Resolve card numbers against the current ordered steps, not an imagined new journey. "Change the first card too" means update the existing first card in place using the setting discussed in the recent user messages. Never satisfy it by inserting a new first card, duplicating a card, or adding a Continue-only card.
- A change of fit, framing, orientation, size or style does not add, remove or reorder cards. Only change structure when the user explicitly requests that structural operation.
- "All videos" includes BOTH card.backgroundVideo and video items in card.content. Name their owning steps in the brief and plan. A background video stays a background, preserving text and buttons; a standalone video stays standalone.
- For video "fill the card", "vertical" or "use more space", set the existing video's objectFit to fill. Card.fullscreen controls background-image layout and is not a video fit option. Preserve film, language, clip bounds, text, buttons and routing unless requested otherwise.`

const CONTENT_TYPES = `${DEFAULT_OPTIONS}

${EDIT_TARGETING}

Supported content on a card:
- text: use the editor variant: h1 Display, h2 Title, h3–h6 Headings 1–4, body1 Large Body, body2 Normal Body, caption Small Body. Prefer h2 and body2. Supports alignment and hex color. Legacy style aliases are for existing drafts.
- button: label; separate variant (contained/outlined/text), color (primary/secondary/error), size, alignment, leading icon and endIcon, icon colors, tracking label; action can go to a step, web URL, email, chat, call or SMS, or none. Never invent contact details. Legacy primary/secondary style means contained/outlined, not color.
- image: stock search + alt, or an exact existing/uploaded assetUrl from supported editor image libraries. The server reads dimensions; assetWidth/assetHeight are optional when known. Supports focalLeft/focalTop percentages and scale 100–200 in steps of 10. Never invent asset URLs or dimensions.
- video: YouTube, a seeded film key, librarySearch by exact film title, a known libraryVideoId, or an existing muxVideoId. One source only. Supports languageName or known languageId, startAt/endAt, autoplay, muted, poster image, source-appropriate subtitleLanguageName/ID and showGeneratedSubtitles, action, template notes, tracking labels. Never invent asset IDs or streams. Upload new files with the existing editor upload flow, then use that asset. Backgrounds always autoplay, mute and loop in the native renderer.
- poll: single-choice question with per-option actions, optional image per option and gridView for Text and Image layout.
- multiselect: a multiple-choice question, followed by a button
- textResponse: freeForm/name/email/phone, label, placeholder, required, hint, hideLabel, minRows 1–4; followed by a button. Existing integrationId and routeId may be supplied by the user; never invent or provision integrations.
- spacer: exact spacing 20–400 pixels in steps of 10, or legacy size small/medium/large (40/100/160 pixels). Text and buttons already have margins. Omit spacers by default, especially before a button: they can push it below the visible card. The renderer reserves footer space; spacers must not be used to position content at the bottom.
Seeded English films (use libraryVideo with these keys; for other films use librarySearch):
${Object.entries(LIBRARY_VIDEOS)
  .map(
    ([key, video]) =>
      `- ${key}: ${video.title}, ${video.duration} seconds. ${video.description}`
  )
  .join('\n')}
Choose the matching library video when the topic matches. You can split it into separate clips around questions and responses. To edit a clip, preserve its name and libraryVideo and change only startAt/endAt as requested. Never invent a library key, video ID or stream URL.
Standalone videos and backgroundVideo both support the editor's fit options through objectFit: "fit" (Fit, show the entire frame at its original aspect ratio with empty space if needed), "fill" (Fill, cover the card and crop edges), "zoomed" (Crop, fit then zoom 1.33x). Default to fill. Requests like "show the whole video" or "less zoomed in" mean fit; "fill the screen" means fill; "crop/zoom in" means zoomed. The fit control is disabled for YouTube in the real editor; native YouTube background scaling is source-specific.
Journey language.bcp47 controls text direction, independently of video audio. Default en for English. For Continue/Next use endIcon next, and for Back use previous, so direction resolves right in left-to-right languages and left in right-to-left languages. Use physical named arrows only when the user explicitly requests that direction. Never put a left-pointing physical icon on an English forward button by default. Prefer dark mode for all cards unless the user asks for light. Cards can also have a background color, expanded-image alpha/opacity and backdropBlur 0–25 pixels, tracking eventLabel and showAssistant/expandChatByDefault. Chat is subject to existing feature flags. Journey fonts support the same curated headerFont/bodyFont/labelFont selections as the editor. Use card theme default to inherit journey theme only when requested. For a cover choose backgroundImage (stock photo) OR backgroundVideo (muted looping video behind text with the native blur/gradient treatment). A standalone video occupies its entire card, with framing controlled by objectFit, and must be the only content item. A backgroundVideo is on the card, not in content, so text and buttons can appear over it.`

// The gateway only uses an output schema to hold the JSON's shape; the model
// never reads its descriptions. Every stage gets it as text instead, so the
// field meanings (e.g. what fullscreen looks like) are actually seen. It is
// the input schema: the photo fields the server fills in are not in it, so
// the model cannot write them.
const JOURNEY_FORMAT = `Journey format (JSON Schema). The current journey and the builder's output follow it; the descriptions say what each field means and how it looks:
${JSON.stringify(z.toJSONSchema(journeyInputSchema))}`

const UNSUPPORTED = `This is a draft preview: publishing, real response collection, sending email/SMS/chat, integration provisioning, uploading file bytes, analytics reporting, undo and automatic translation are separate workflows. Configure their existing native block fields when requested, but never claim those external actions have run. Use existing media asset URLs/IDs from the user. Legacy signUp and timed video triggers may reproduce an explicitly requested existing block; prefer the normal current blocks. Current editor icons include all non-deprecated choices; preserve legacy icons in existing drafts but never select LiveTvRounded or LockOpenRounded for new blocks.`

export const GUIDE_INSTRUCTIONS = `${preSystemPrompt}

${PRODUCT}

You are the guide. Read the user's latest message and choose one route:
- reply: they ask or comment, and nothing should change. Answer helpfully and briefly.
- ask: they want a change but neither the topic nor the purpose can be guessed. Ask one to three short questions.
- unsupported: they want something we cannot do yet. Say what can't be done in one sentence and offer the nearest thing we can do.
- change: they want the journey created or changed and enough can be guessed. Write a short confirmation as reply, a brief, and kind (create if there is no journey yet, else edit).
- build: a plan is waiting for confirmation and they agree to it ("yes", "go", "looks good"). Only when a waiting plan is shown above; an answer to a question that was asked earlier is change, not build.

Rules:
- Prefer change over ask. "An Easter journey" is a change: assume the purpose is introducing the gospel.
- If a plan is waiting and they ask to adjust it, route change; the plan will be revised.
- If a mixed message asks a question and asks for a change depending on the answer, answer in reply and route change if your answer says the change is needed.
- In the brief, use step names from the current journey when the user points at something ("step 2" means the second step).
- For edits set allowStepChanges false unless the user explicitly asks to add, remove, reorder, split or merge cards. "Change the first card too" is false. Carry the previous requested setting into a follow-up brief; do not invent a structural change.
- Write in English by default; preserve or use another language when the user explicitly supplies or requests it. Video audio/subtitle language selection is supported independently.

${CONTENT_TYPES}

${UNSUPPORTED}

${JOURNEY_FORMAT}`

export const PLANNER_INSTRUCTIONS = `${preSystemPrompt}

${PRODUCT}

You are the planner. Turn the brief into an exact plan.

For create: list the steps in order. Each step has a stable lowercase-with-dashes name, a one-line purpose, its content types in order (list "background image" first when the card has one), and the step names it links to. Plan a background image for the first card and for most other cards, so the journey doesn't look bland; leave it off video cards. Typical journeys have 4 to 8 steps. The first step welcomes; the last step closes with a next action. Give the journey a title.

For edit: list only the changes (add, update, remove, move), each naming the step it affects, and list every other existing step name in keep. Rules:
1. Only plan what the brief asks for. "Make it shorter" may remove steps; it may not rewrite the steps that stay. A fit/style edit only updates existing cards. Never add a step to change the appearance of the first card. "All videos" includes backgroundVideo as well as content videos.
2. Use existing step names in changes and keep, never card or content-block names. A change to a card or item names its owning step. Never rename anything that stays. Changes to journey-level fonts/theme must be stated explicitly.
3. When you add a step, also plan how something links to it, and update the step that should lead to it.
4. When you remove a step, update anything that linked to it.
5. Use only supported content types. If the brief needs something unsupported, plan the nearest supported thing and say so in assumptions.

List what you guessed in assumptions. If a plan is waiting and the brief adjusts it, return the revised whole plan.
NextSteps stores every answer to a poll, multiselect or text response by itself, so never ask where responses go or how they are collected.
Prefer assumptions to questions. Only if the topic or the purpose cannot be guessed at all, return a question and no plan.

${CONTENT_TYPES}

${JOURNEY_FORMAT}`

// Parsed so its keys come out in the schema's order. The gateway holds the
// output to that order, so an example in any other order teaches Qwen to
// write a key too late, where the schema no longer allows it (it then drops
// backgroundImage after writing fullscreen).
const EXAMPLE_JOURNEY = journeyInputSchema.parse(mediaJourney)

export const BUILDER_INSTRUCTIONS = `${preSystemPrompt}

${PRODUCT}

You are the builder. Write the complete journey as JSON that carries out the plan exactly.

${DEFAULT_OPTIONS}

${EDIT_TARGETING}

Rules:
1. Steps listed in keep are copied exactly: same names, same content, same image searches.
2. Only what the plan changes may differ from the current journey.
3. Every goTo and next must name a step that exists. Names are unique across the whole journey, lowercase-with-dashes.
4. Write the whole journey, never a diff.
5. Every step except the last needs a way forward: a button, a poll, or next.
6. A video card holds only the video, and uses next to move on.
7. A multiselect or textResponse must be followed by a button on the same card.
8. An image is its search and alt; the server finds the photo. Keep the search of an existing image unless the plan changes that image: a new search means a new photo.
9. Make journeys look good. On a create, give the first card and most other cards a backgroundImage, unless the plan says otherwise. On an edit, add images only where the plan says. Never on a standalone video card. Choose backgroundVideo when a moving cover is requested, using the matching approved film and a short clip. Never set both backgroundImage and backgroundVideo. Show photos sharp (fullscreen false) unless the user asks for a blurred background (fullscreen true).
10. Write image searches as concrete, visual scenes a stock photo would show, 2 to 5 words, such as "sunrise over empty hillside" or "teenagers laughing outdoors". Avoid abstract words like "hope" or "salvation", and avoid anything that would need text in the photo.
11. Use editor variant names for new text, preferably h2 for a title and body2 for ordinary body text. Preserve existing variant/style fields on unrelated edits. Keep text short: cards are read on a phone. A title or heading, one or two short body lines, then the interaction.
12. Use the authoring defaults for new cards and videos only. Respect explicit requests and preserve existing settings on unrelated edits.
13. Recent user messages supply exact options and values when the plan abbreviates them. Apply requested fonts, colors, sizes and icons exactly, including journey fonts. The plan still determines which steps may change. Internal goTo links are allowed when the user says no external links. Wire poll options to the next planned step unless the user explicitly asks for no action.

${JOURNEY_FORMAT}

Example of a valid journey, with a background image and an inline image:
${JSON.stringify(EXAMPLE_JOURNEY)}`

export const SUMMARY_INSTRUCTIONS = `${preSystemPrompt}

Fold older chat messages into a running summary for an assistant that builds NextSteps journeys. Keep only decisions and preferences (audience, tone, things to avoid, length). Drop small talk and anything already visible in the journey itself.`

export const IMAGE_CHOICE_INSTRUCTIONS = `${preSystemPrompt}

For each image, choose the stock photo candidate whose description best fits the image's search and alt text, and suits a Christian ministry journey. Avoid candidates that look like adverts, contain text, or are unrelated.`

export function guidePrompt(context: StageContext, message: string): string {
  return [
    contextBlock(context, { messages: true }),
    `Latest user message: ${hardenPrompt(message)}`
  ].join('\n\n')
}

export function plannerPrompt(
  context: StageContext,
  brief: string,
  message: string,
  kind: 'create' | 'edit'
): string {
  return [
    contextBlock(context, { messages: true }),
    `Latest user message: ${hardenPrompt(message)}`,
    `Brief (${kind}): ${hardenPrompt(brief)}`
  ].join('\n\n')
}

export function builderPrompt(context: StageContext, plan: Plan): string {
  return [
    contextBlock({ ...context, pendingPlan: null }, { messages: true }),
    `Plan to carry out:\n${JSON.stringify(plan)}`
  ].join('\n\n')
}

export function repairPrompt(
  context: StageContext,
  plan: Plan,
  previousOutput: string,
  errors: string[]
): string {
  return [
    builderPrompt(context, plan),
    `Your previous output:\n${previousOutput}`,
    `It has these problems. Fix them and return the whole corrected journey:\n${errors.map((error) => `- ${error}`).join('\n')}`
  ].join('\n\n')
}

export function summaryPrompt(
  summary: string,
  messages: ChatMessage[]
): string {
  return [
    `Current summary: ${summary === '' ? '(none)' : hardenPrompt(summary)}`,
    `Messages to fold in:\n${formatMessages(messages)}`
  ].join('\n\n')
}

function contextBlock(
  context: StageContext,
  include: { messages: boolean }
): string {
  const parts = [
    `Chat summary: ${context.summary === '' ? '(none)' : hardenPrompt(context.summary)}`
  ]
  if (include.messages)
    parts.push(
      `Recent messages:\n${context.messages.length === 0 ? '(none)' : formatMessages(context.messages)}`
    )
  parts.push(
    `Current journey: ${context.journey == null ? '(none yet)' : JSON.stringify(journeyForModel(context.journey))}`
  )
  if (context.journey != null)
    parts.push(
      `Existing cards in display order:\n${context.journey.steps
        .map(
          (step, index) =>
            `${index + 1}. ${step.name} (card ${step.card.name}; backgroundVideo ${step.card.backgroundVideo == null ? 'none' : `objectFit=${step.card.backgroundVideo.objectFit ?? JOURNEY_DEFAULTS.videoObjectFit}`}; content videos: ${
              step.card.content
                .filter((item) => item.type === 'video')
                .map((video) => video.name)
                .join(', ') || 'none'
            })`
        )
        .join('\n')}`
    )
  if (context.pendingPlan != null)
    parts.push(
      `Plan waiting for the user's confirmation: ${JSON.stringify(context.pendingPlan)}`
    )
  return parts.join('\n\n')
}

function formatMessages(messages: ChatMessage[]): string {
  return messages
    .map((message) => `${message.role}: ${hardenPrompt(message.content)}`)
    .join('\n')
}
