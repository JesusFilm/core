import { z } from 'zod'

import { hardenPrompt, preSystemPrompt } from '@core/shared/ai/prompts'

import { type Journey, journeySchema } from '../journeySchema'
import { mediaJourney } from '../journeySchema/examples'

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

const CONTENT_TYPES = `Supported content on a card:
- text: title, heading, subtitle, body or caption
- button: goes to another step or opens a link; optional icon
- image: a stock photo from Unsplash, found by a search phrase
- video: a YouTube video only (on its own card)
- poll: a single-choice question; each option goes to a step or link
- multiselect: a multiple-choice question, followed by a button
- textResponse: a free text, name or email field, followed by a button
- spacer: vertical space
Cards can be light or dark, have a background colour, and a background image (a stock photo from Unsplash).`

// The gateway only uses an output schema to hold the JSON's shape; the model
// never reads its descriptions. Every stage gets it as text instead, so the
// field meanings (e.g. what fullscreen looks like) are actually seen.
const JOURNEY_FORMAT = `Journey format (JSON Schema). The current journey and the builder's output follow it; the descriptions say what each field means and how it looks:
${JSON.stringify(z.toJSONSchema(journeySchema))}`

const UNSUPPORTED = `Not supported yet: Jesus Film library videos, video uploads, undo, translation or other languages, publishing or sharing, sign-up forms, email/phone/chat buttons, analytics, custom fonts.`

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
- English only.

${CONTENT_TYPES}

${UNSUPPORTED}

${JOURNEY_FORMAT}`

export const PLANNER_INSTRUCTIONS = `${preSystemPrompt}

${PRODUCT}

You are the planner. Turn the brief into an exact plan.

For create: list the steps in order. Each step has a stable lowercase-with-dashes name, a one-line purpose, its content types in order (list "background image" first when the card has one), and the step names it links to. Plan a background image for the first card and for most other cards, so the journey doesn't look bland; leave it off video cards. Typical journeys have 4 to 8 steps. The first step welcomes; the last step closes with a next action. Give the journey a title.

For edit: list only the changes (add, update, remove, move), each naming the step it affects, and list every other existing step name in keep. Rules:
1. Only plan what the brief asks for. "Make it shorter" may remove steps; it may not rewrite the steps that stay.
2. Use existing names. Never rename anything that stays.
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
const EXAMPLE_JOURNEY = journeySchema.parse(mediaJourney)

export const BUILDER_INSTRUCTIONS = `${preSystemPrompt}

${PRODUCT}

You are the builder. Write the complete journey as JSON that carries out the plan exactly.

Rules:
1. Steps listed in keep are copied exactly: same names, same content, same image objects.
2. Only what the plan changes may differ from the current journey.
3. Every goTo and next must name a step that exists. Names are unique across the whole journey, lowercase-with-dashes.
4. Write the whole journey, never a diff.
5. Every step except the last needs a way forward: a button, a poll, or next.
6. A video card holds only the video, and uses next to move on.
7. A multiselect or textResponse must be followed by a button on the same card.
8. For a new image write only search and alt. Never write src, width, height or blurhash yourself; keep them on images that already have them.
9. Make journeys look good. On a create, give the first card and most other cards a backgroundImage, unless the plan says otherwise. On an edit, add images only where the plan says. Never on a video card. Show photos sharp (fullscreen false) unless the user asks for a blurred background (fullscreen true).
10. Write image searches as concrete, visual scenes a stock photo would show, 2 to 5 words, such as "sunrise over empty hillside" or "teenagers laughing outdoors". Avoid abstract words like "hope" or "salvation", and avoid anything that would need text in the photo.
11. Keep text short: cards are read on a phone. A title or heading, one or two short body lines, then the interaction.
12. Use light and dark themes deliberately; keep a journey visually consistent.

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
    contextBlock({ ...context, pendingPlan: null }, { messages: false }),
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
    `Current journey: ${context.journey == null ? '(none yet)' : JSON.stringify(context.journey)}`
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
