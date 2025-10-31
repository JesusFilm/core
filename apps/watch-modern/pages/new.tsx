import {
  ArrowUp,
  Bot,
  HelpCircle,
  History,
  Image as ImageIcon,
  Loader2,
  Settings,
  Sparkles,
  Trash2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ContextSelector } from '../src/components/newPage/ContextSelector'
import { ConversationMapView } from '../src/components/newPage/ConversationMapView'
import { MainPromptBlock } from '../src/components/newPage/MainPromptBlock'
import { RotatingText } from '../src/components/newPage/RotatingText'
import { StepsList } from '../src/components/newPage/StepsList'
import { PrayerCarousel } from '../src/components/PrayerCarousel'
import { Accordion } from '../src/components/ui/accordion'
import { StudioSiteSelector } from '../src/components/studio-site-selector'
import { Button } from '../src/components/ui/button'
import { Card } from '../src/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../src/components/ui/carousel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../src/components/ui/dialog'
import { Input } from '../src/components/ui/input'
import {
  BASE_SYSTEM_PROMPT,
  IMAGE_ANALYSIS_PROMPT,
  REFINEMENT_INSTRUCTIONS,
  contextDetailOptions,
  steps
} from '../src/config/new-page'
import { useAiStream } from '../src/hooks/useAiStream'
import { useImageAnalysis } from '../src/hooks/useImageAnalysis'
import { useNewPageSession } from '../src/hooks/useNewPageSession'
import { useUnsplashMedia } from '../src/hooks/useUnsplashMedia'
import {
  type ConversationMap,
  type GeneratedStepContent,
  type ImageAnalysisResult,
  type UserInputData,
  userInputStorage
} from '../src/libs/storage'

import { AutoResizeTextarea } from '@core/shared/uimodern/components/textarea'
// Dynamic imports for components to avoid hydration issues

const FormatSelection = dynamic(
  async () => {
    const mod = await import(
      /* webpackChunkName: "studio-format-selection" */ '../src/components/newPage/FormatSelection'
    )
    return mod.FormatSelection
  },
  { ssr: false }
)

const isDebugLoggingEnabled = process.env.NODE_ENV !== 'production'
const SHOW_PRAYER_CAROUSEL = false // Temporarily hide prayer messages while awaiting AI responses

type KitchenSinkPersonaSettings = {
  personaName: string
  audienceDescription: string
  tone: string
  goals: string
}

type KitchenSinkData = {
  selectedContext: string
  selectedContextDetail: string
  prompt: string
  personaSettings: KitchenSinkPersonaSettings
  aiResponse: string
  editableSteps: GeneratedStepContent[]
  conversationMap: ConversationMap
  imageAnalysisResults: ImageAnalysisResult[]
  imageAttachments?: string[]
  tokensUsed: {
    input: number
    output: number
  }
}

const DEFAULT_OUTPUT_FORMAT_INSTRUCTIONS = `Provide the response as JSON with this structure:
{
  "steps": [
    {
      "content": "# Short label for the step (max 6 words)\\n\\nMarkdown-formatted instagram sotry or messages copy for this step",
      "keywords": "singleword-keyword, singleword-keyword, singleword-keyword",
      "mediaPrompt": "≤150 character prompt for an image/video generator"
    }
  ]
}`

const CONVERSATION_OUTPUT_FORMAT_INSTRUCTIONS = `Provide the response as JSON with this structure:
{
  "conversationMap": {
    "flow": {
      "sequence": [
        "Word or short phrase that names each movement in order (e.g., 'shared weakness')"
      ],
      "rationale": "Short explanation for why this flow helps the responder."
    },
    "steps": [
      {
        "title": "Short step heading (max 6 words)",
        "purpose": "Why this exchange matters. Use null if redundant.",
        "guideMessage": "2-3 sentence message for the ministry guide to say in warm, empathetic tone.",
        "scriptureOptions": [
          {
            "text": "1-2 sentence scripture excerpt that reinforces the moment.",
            "reference": "Book chapter:verse format. Use null if no scripture fits.",
            "whyItFits": "Explain why this verse supports the step and how to transition toward it.",
            "conversationExamples": [
              {
                "tone": "Tone label (e.g., Friendly, Gentle, Salty).",
                "message": "Concrete phrasing the guide could use in that tone."
              }
            ]
          }
        ]
      }
    ]
  }
}`

const DEFAULT_RESPONSE_GUIDELINES = `Guidelines:
- Include 7-12 sequential steps tailored to the user's request.
- Keep the core spiritual message while making each step social-ready.
- Provide three exactly single-word keywords per step that is suitable for Unsplash image searches.
- The mediaPrompt should align with the step's tone and visuals.
- Use markdown formatting inside the content field when helpful.
- Begin each content field with a level-one markdown heading that states the step's short label (e.g., '# Let Your Light Shine') followed by a blank line.`

const MAX_CONVERSATION_STEPS = 5

const CONVERSATION_RESPONSE_GUIDELINES = `Guidelines:
- Map an ideal path of up to ${MAX_CONVERSATION_STEPS} guide-led conversation moves that gently progress toward gospel hope.
- Summarize the overall movement first with a 'flow' that lists each step's short theme in order and a brief rationale for why this journey helps the responder.
- Every step must include a guide message, a purpose note (or null), and at least three scriptureOptions. Each scripture option needs the verse text/reference, a note on why it fits/how to migrate the conversation toward it, and multiple tone-tagged conversation examples.
 - Maintain warm, pastoral tone across the guide messages, verse explanations, and conversation examples. Keep each message concise enough to fit in a chat bubble.
- Do not include design instructions, media prompts, or image keywords in any field.
- Output valid JSON only.`

const contextSystemPrompts: Record<string, string> = {
  default:
    'Default to producing ministry-ready resources that can flex between digital and in-person sharing when no specific context is selected. Provide balanced guidance that keeps the content adaptable.',
  'Conversations':
    'Guide one-on-one or small group conversations that gently introduce gospel truths. Return structured JSON for a chat-style conversation map that begins with a flow overview (sequence plus rationale), then lists steps with guide messages and multi-verse scriptureOptions (each with why-it-fits notes and tone-labeled conversation examples). Emphasize listening, questions, prayerful transitions, and Scripture when natural. Avoid design instructions and image keywords in this mode.',
  'Social Media':
    'Operate like a Canva-style designer for social media campaigns. Treat each step as a templated design idea for stories, carousels, reels, or feed posts. Suggest layout direction, color palettes, typography moods, and short, scroll-stopping copy. Keep platform conventions (vertical ratios, accessibility, alt-text) in mind and tailor media prompts to energetic, template-friendly visuals.',
  Website:
    'Act as a simple website builder focused on ministry landing pages. Outline hero messaging, section structure, calls to action, and follow-up pathways that help visitors take the next spiritual step. Provide guidance on responsive layout, navigation clarity, and content hierarchy. Recommend imagery that builds trust and a welcoming digital doorway, and craft media prompts for cohesive hero or section artwork.',
  Print:
    'Serve as a Canva-style designer producing print-ready assets that will be downloaded as PDFs. Include details about page sizes, margin or bleed considerations when helpful, and ensure copy remains legible in physical formats. Suggest tangible distribution ideas such as flyers, postcards, or posters. Shape media prompts around high-resolution artwork that reproduces cleanly when printed.',
  'Real Life':
    'Support real-world ministry efforts beyond digital channels. Offer actionable steps for events, discipleship moments, pastoral care, missions, or community service. Provide talking points, activity ideas, and tangible follow-up resources that equip Christians, missionaries, and pastors. Encourage cultural sensitivity and spiritual discernment, and use media prompts to inspire helpful reference visuals, handouts, or props.'
}

const getOutputFormatInstructions = (context: string): string =>
  context === 'Conversations'
    ? CONVERSATION_OUTPUT_FORMAT_INSTRUCTIONS
    : DEFAULT_OUTPUT_FORMAT_INSTRUCTIONS

const getResponseGuidelines = (context: string): string =>
  context === 'Conversations'
    ? CONVERSATION_RESPONSE_GUIDELINES
    : DEFAULT_RESPONSE_GUIDELINES

type SelectedOutputsMap = Record<string, string[]>

const DIMENSION_REGEX = /(\d+)\s*[×xX]\s*(\d+)/

const getPrimaryOutputSelection = (
  outputs: SelectedOutputsMap
): string | null => {
  for (const options of Object.values(outputs)) {
    if (options && options.length > 0) {
      return options[0]
    }
  }
  return null
}

const parseDimensionsFromLabel = (label: string | null) => {
  const fallback = { width: 1080, height: 1920 }
  if (!label) {
    return fallback
  }

  const match = label.match(DIMENSION_REGEX)
  if (!match) {
    return fallback
  }

  const width = Number.parseInt(match[1], 10)
  const height = Number.parseInt(match[2], 10)

  if (Number.isNaN(width) || Number.isNaN(height)) {
    return fallback
  }

  return { width, height }
}

const splitContentIntoSections = (content: string) => {
  return content
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter((section) => section.length > 0)
}

const extractHeadingAndBody = (section: string) => {
  const rawLines = section.split('\n')
  let heading = ''
  const bodyLines: string[] = []
  let headingCaptured = false

  for (const rawLine of rawLines) {
    if (!headingCaptured) {
      const trimmed = rawLine.trim()
      if (trimmed.length === 0) continue

      const headingMatch = trimmed.match(/^#{1,6}\s+(.*)$/)
      heading = headingMatch ? headingMatch[1].trim() : trimmed
      headingCaptured = true
      continue
    }

    bodyLines.push(rawLine)
  }

  if (!headingCaptured) {
    return { heading: '', body: '' }
  }

  const body = bodyLines.join('\n').trim()

  if (body.length === 0) {
    const sentences = heading
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0)

    const primaryHeading = sentences.shift() ?? heading

    return {
      heading: primaryHeading,
      body: sentences.join(' ').trim()
    }
  }

  return {
    heading,
    body
  }
}

const deriveHeadingFromContent = (content: string, fallback: string) => {
  if (!content) return fallback
  const { heading } = extractHeadingAndBody(content)
  return heading || fallback
}

const deriveBodyFromContent = (content: string) => {
  if (!content) return ''
  const { body } = extractHeadingAndBody(content)
  return body
}

const normalizeGeneratedSteps = (
  steps: Array<
    Partial<GeneratedStepContent> & { title?: string; keywords?: string | string[] }
  >
): GeneratedStepContent[] =>
  steps.map((step) => {
    const keywordsValue = step?.keywords as string | string[] | undefined
    const normalizedKeywords = Array.isArray(keywordsValue)
      ? keywordsValue
          .map((keyword) =>
            typeof keyword === 'string'
              ? keyword.trim()
              : String(keyword ?? '').trim()
          )
          .filter((keyword) => keyword.length > 0)
          .slice(0, 3)
      : typeof keywordsValue === 'string'
      ? keywordsValue
          .split(',')
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0)
          .slice(0, 3)
      : []

    const rawTitle =
      typeof step?.title === 'string' ? step.title.trim() : ''

    let content =
      typeof step?.content === 'string' ? step.content.trim() : ''

    if (rawTitle) {
      if (!content) {
        content = `# ${rawTitle}`
      } else {
        const firstMeaningfulLine =
          content
            .split('\n')
            .map((line) => line.trim())
            .find((line) => line.length > 0) ?? ''

        if (!/^#{1,6}\s+/.test(firstMeaningfulLine)) {
          content = `# ${rawTitle}\n\n${content}`.trim()
        }
      }
    }

    const mediaPrompt =
      typeof step?.mediaPrompt === 'string' ? step.mediaPrompt.trim() : ''

    return {
      content,
      keywords: normalizedKeywords,
      mediaPrompt
    }
  })

const normalizeConversationMap = (rawData: unknown): ConversationMap => {
  const ensureString = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : ''

  const ensureNullableString = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const ensureStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map(item => ensureString(item)).filter(Boolean)
    }

    if (typeof value === 'string') {
      return value
        .split(/(?:→|➡️|>|-)+|,|\n+/)
        .map(segment => segment.trim())
        .filter(Boolean)
    }

    return []
  }

  const normalizeFlow = (input: unknown): ConversationMap['flow'] => {
    if (input == null) return null

    if (typeof input !== 'object') {
      const rationale = ensureNullableString(input)
      return rationale ? { sequence: [], rationale } : null
    }

    const flowRecord = input as Record<string, unknown>
    const sequence = ensureStringArray(
      flowRecord.sequence ?? flowRecord.steps ?? flowRecord.path ?? flowRecord.movement ?? flowRecord.flow
    ).slice(0, MAX_CONVERSATION_STEPS)

    const rationale = ensureNullableString(
      flowRecord.rationale ?? flowRecord.reason ?? flowRecord.commentary ?? flowRecord.summary ?? flowRecord.context
    )

    if (sequence.length === 0 && !rationale) {
      return null
    }

    return {
      sequence,
      rationale
    }
  }

  const normalizeLegacyScripture = (
    input: unknown
  ): { text: string | null; reference: string | null } | null => {
    if (input == null) return null

    if (typeof input === 'string') {
      const text = input.trim()
      if (!text) return null
      return { text, reference: null }
    }

    if (typeof input === 'object') {
      const record = input as Record<string, unknown>
      const text = ensureNullableString(
        record.text ?? record.passage ?? record.quote ?? record.content ?? record.verseText ?? record.verse
      )
      const reference = ensureNullableString(
        record.reference ?? record.ref ?? record.citation ?? record.verse ?? record.book
      )

      if (!text && !reference) {
        return null
      }

      return {
        text,
        reference
      }
    }

    return null
  }

  const normalizeConversationExamples = (
    input: unknown
  ): ConversationMap['steps'][number]['scriptureOptions'][number]['conversationExamples'] => {
    if (input == null) return []

    if (Array.isArray(input)) {
      return input
        .map((example, index) => {
          if (typeof example === 'string') {
            const message = ensureString(example)
            if (!message) return null
            return {
              tone: `Example ${index + 1}`,
              message
            }
          }

          if (typeof example === 'object' && example !== null) {
            const record = example as Record<string, unknown>
            const message = ensureString(
              record.message ?? record.text ?? record.content ?? record.example
            )
            if (!message) return null

            const tone = ensureString(
              record.tone ?? record.style ?? record.label ?? record.title
            )

            return {
              tone: tone || `Example ${index + 1}`,
              message
            }
          }

          return null
        })
        .filter((example): example is ConversationMap['steps'][number]['scriptureOptions'][number]['conversationExamples'][number] => example !== null)
    }

    if (typeof input === 'object') {
      return Object.entries(input as Record<string, unknown>)
        .map(([toneKey, value], index) => {
          const message = ensureString(value)
          if (!message) return null

          const tone = ensureString(toneKey)
          return {
            tone: tone || `Example ${index + 1}`,
            message
          }
        })
        .filter((example): example is ConversationMap['steps'][number]['scriptureOptions'][number]['conversationExamples'][number] => example !== null)
    }

    if (typeof input === 'string') {
      const message = ensureString(input)
      return message
        ? [
            {
              tone: 'Example',
              message
            }
          ]
        : []
    }

    return []
  }

  const normalizeScriptureOptions = (
    item: unknown
  ): ConversationMap['steps'][number]['scriptureOptions'] => {
    if (typeof item !== 'object' || item === null) {
      return []
    }

    const itemRecord = item as Record<string, unknown>

    const optionsSource = Array.isArray(itemRecord.scriptureOptions)
      ? itemRecord.scriptureOptions
      : Array.isArray(itemRecord.scriptures)
        ? itemRecord.scriptures
        : Array.isArray(itemRecord.bibleVerses)
          ? itemRecord.bibleVerses
          : Array.isArray(itemRecord.verses)
            ? itemRecord.verses
            : []

    const normalized = optionsSource
      .map((option) => {
        if (!option) return null

        if (typeof option === 'string') {
          const text = ensureString(option)
          if (!text) return null
          return {
            text,
            reference: null,
            whyItFits: null,
            conversationExamples: []
          }
        }

        if (typeof option === 'object' && option !== null) {
          const optionRecord = option as Record<string, unknown>
          const text = ensureNullableString(
            optionRecord.text ?? optionRecord.passage ?? optionRecord.quote ?? optionRecord.content ?? optionRecord.verseText
          )
          const reference = ensureNullableString(
            optionRecord.reference ?? optionRecord.ref ?? optionRecord.citation ?? optionRecord.verse ?? optionRecord.book
          )
          const whyItFits = ensureNullableString(
            optionRecord.whyItFits ?? optionRecord.reason ?? optionRecord.explanation ?? optionRecord.transition ?? optionRecord.structure ?? optionRecord.context
          )
          const conversationExamples = normalizeConversationExamples(
            optionRecord.conversationExamples ?? optionRecord.messageExamples ?? optionRecord.messages ?? optionRecord.examples
          )

          if (!text && !reference && !whyItFits && conversationExamples.length === 0) {
            return null
          }

          return {
            text,
            reference,
            whyItFits,
            conversationExamples
          }
        }

        return null
      })
      .filter((option): option is ConversationMap['steps'][number]['scriptureOptions'][number] => option !== null)

    if (normalized.length === 0) {
      const legacyScripture = normalizeLegacyScripture(
        itemRecord.scripture ?? itemRecord.scriptureSupport
      )
      if (legacyScripture) {
        normalized.push({
          text: legacyScripture.text,
          reference: legacyScripture.reference,
          whyItFits: ensureNullableString(
            itemRecord.scriptureExplanation ?? itemRecord.scriptureWhy ?? itemRecord.whyItFits ?? itemRecord.transition
          ),
          conversationExamples: []
        })
      }
    }

    return normalized
  }

  const rawRecord =
    (typeof rawData === 'object' && rawData !== null
      ? rawData
      : {}) as Record<string, unknown>

  const legacyIdealPath = Array.isArray(rawRecord.idealPath)
    ? rawRecord.idealPath
    : []

  const stepsSource = Array.isArray(rawRecord.steps)
    ? rawRecord.steps
    : legacyIdealPath

  const normalizedSteps = stepsSource
    .map((item, index) => {
      const itemRecord =
        (typeof item === 'object' && item !== null
          ? item
          : {}) as Record<string, unknown>

      const guideMessage = ensureString(itemRecord.guideMessage ?? itemRecord.guideResponse)
      if (!guideMessage) return null

      const title = ensureString(itemRecord.title ?? itemRecord.stage)
      const purpose = ensureNullableString(itemRecord.purpose)

      const scriptureOptions = normalizeScriptureOptions(itemRecord)

      return {
        title: title || `Step ${index + 1}`,
        purpose,
        guideMessage,
        scriptureOptions
      }
    })
    .filter((item): item is ConversationMap['steps'][number] => item !== null)
    .slice(0, MAX_CONVERSATION_STEPS)

  return {
    flow: normalizeFlow(
      rawRecord.flow ?? rawRecord.flowSummary ?? rawRecord.conversationFlow ?? rawRecord.movement
    ),
    steps: normalizedSteps
  }
}

const generateElementId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`

type TextElementConfig = {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  align: 'left' | 'center'
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fill: string
  lineHeight: number
}

type MediaElementConfig = {
  id: string
  src: string
  width: number
  height: number
  type?: 'image' | 'video'
  x?: number
  y?: number
}

type OverlayElementConfig = {
  id: string
  width: number
  height: number
  opacity?: number
}

type DesignElement =
  | ReturnType<typeof createTextElement>
  | ReturnType<typeof createMediaElement>
  | ReturnType<typeof createOverlayElement>

const createTextElement = ({
  id,
  text,
  x,
  y,
  width,
  height,
  fontSize,
  align,
  fontFamily,
  fontWeight,
  fill,
  lineHeight
}: TextElementConfig) => ({
  id,
  type: 'text',
  name: '',
  opacity: 1,
  visible: true,
  selectable: true,
  removable: true,
  alwaysOnTop: false,
  showInExport: true,
  x,
  y,
  width,
  height,
  rotation: 0,
  animations: [],
  blurEnabled: false,
  blurRadius: 10,
  brightnessEnabled: false,
  brightness: 0,
  sepiaEnabled: false,
  grayscaleEnabled: false,
  filters: {},
  shadowEnabled: false,
  shadowBlur: 5,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: 'black',
  shadowOpacity: 1,
  draggable: true,
  resizable: true,
  contentEditable: true,
  styleEditable: true,
  text,
  placeholder: '',
  fontSize,
  fontFamily,
  fontStyle: 'normal',
  fontWeight,
  textDecoration: '',
  fill,
  align,
  verticalAlign: 'top',
  strokeWidth: 0,
  stroke: 'black',
  lineHeight,
  letterSpacing: 0,
  backgroundEnabled: false,
  backgroundColor: '#FFFFFF',
  backgroundOpacity: 1,
  backgroundCornerRadius: 0.5,
  backgroundPadding: 0.5
})

const createMediaElement = ({
  id,
  src,
  width,
  height,
  type = 'image',
  x = 0,
  y = 0
}: MediaElementConfig) => {
  const base = {
    id,
    type: type === 'video' ? 'video' : 'image',
    name: '',
    opacity: 1,
    visible: true,
    selectable: true,
    removable: true,
    alwaysOnTop: false,
    showInExport: true,
    x,
    y,
    width,
    height,
    rotation: 0,
    animations: [],
    blurEnabled: false,
    blurRadius: 10,
    brightnessEnabled: false,
    brightness: 0,
    sepiaEnabled: false,
    grayscaleEnabled: false,
    filters: {},
    shadowEnabled: false,
    shadowBlur: 5,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: 'black',
    shadowOpacity: 1,
    draggable: true,
    resizable: true,
    contentEditable: false,
    styleEditable: true,
    src,
    cropX: 0,
    cropY: 0,
    cropWidth: 1,
    cropHeight: 1,
    flipX: false,
    flipY: false,
    borderRadius: 0,
    backgroundEnabled: false,
    backgroundColor: '#FFFFFF',
    backgroundOpacity: 1,
    backgroundCornerRadius: 0.5,
    backgroundPadding: 0.5,
    keepRatio: false,
    cornerRadius: 0
  }

  if (type === 'video') {
    return {
      ...base,
      duration: 0,
      startTime: 0,
      endTime: 1,
      volume: 1
    }
  }

  return base
}

const createOverlayElement = ({
  id,
  width,
  height,
  opacity = 0.55
}: OverlayElementConfig) => ({
  id,
  type: 'figure',
  subType: 'rect',
  name: '',
  opacity,
  visible: true,
  selectable: false,
  removable: true,
  alwaysOnTop: false,
  showInExport: true,
  x: 0,
  y: 0,
  width,
  height,
  rotation: 0,
  animations: [],
  blurEnabled: false,
  blurRadius: 10,
  brightnessEnabled: false,
  brightness: 0,
  sepiaEnabled: false,
  grayscaleEnabled: false,
  filters: {},
  shadowEnabled: false,
  shadowBlur: 5,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: 'black',
  shadowOpacity: 1,
  draggable: false,
  resizable: false,
  contentEditable: false,
  styleEditable: true,
  fill: 'rgba(15, 23, 42, 0.75)',
  dash: [],
  strokeWidth: 0,
  stroke: 'rgba(15, 23, 42, 0)',
  cornerRadius: 0
})

const createPolotnoDesignFromContent = ({
  rawContent,
  selectedOutputs,
  steps = []
}: {
  rawContent: string
  selectedOutputs: SelectedOutputsMap
  steps?: GeneratedStepContent[]
}) => {
  const primarySelection = getPrimaryOutputSelection(selectedOutputs)
  const { width, height } = parseDimensionsFromLabel(primarySelection)

  const normalizedSteps = (steps || [])
    .map((step, index) => {
      if (!step) {
        return null
      }

      const fallbackHeading = `Step ${index + 1}`
      const possibleTitle =
        typeof (step as { title?: unknown })?.title === 'string'
          ? ((step as { title?: string }).title ?? '').trim()
          : ''

      let content =
        typeof step?.content === 'string' ? step.content.trim() : ''

      if (!content && possibleTitle) {
        content = `# ${possibleTitle}`
      }

      const heading = deriveHeadingFromContent(
        content,
        possibleTitle || fallbackHeading
      )
      const bodyContent = deriveBodyFromContent(content)

      const keywords = Array.isArray(step.keywords)
        ? step.keywords
            .map((keyword) =>
              typeof keyword === 'string'
                ? keyword.trim()
                : String(keyword ?? '').trim()
            )
            .filter((keyword) => keyword.length > 0)
        : []
      const mediaPrompt =
        typeof step?.mediaPrompt === 'string' ? step.mediaPrompt.trim() : ''

      if (!content && keywords.length === 0 && !mediaPrompt) {
        return null
      }

      return {
        heading,
        content,
        body: bodyContent,
        keywords: keywords.slice(0, 5),
        mediaPrompt,
        selectedImageUrl: step.selectedImageUrl,
        selectedVideoUrl: step.selectedVideoUrl
      }
    })
    .filter(Boolean) as Array<{
      heading: string
      content: string
      body: string
      keywords: string[]
      mediaPrompt: string
      selectedImageUrl?: string
      selectedVideoUrl?: string
    }>

  const hasStructuredSteps = normalizedSteps.length > 0

  const pages = hasStructuredSteps
    ? normalizedSteps.map((step, index) => {
        const headingElement = createTextElement({
          id: generateElementId('heading'),
          text: step.heading,
          x: width * 0.1,
          y: height * 0.12,
          width: width * 0.8,
          height: Math.max(200, height * 0.25),
          fontSize: Math.min(Math.max(width * 0.08, 56), 100),
          align: 'center',
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
          fill: '#ffffff',
          lineHeight: 1.2
        })

        const elements: DesignElement[] = []

        const mediaUrl = step.selectedVideoUrl ?? step.selectedImageUrl
        if (mediaUrl) {
          elements.push(
            createMediaElement({
              id: generateElementId('media'),
              src: mediaUrl,
              width,
              height,
              type: step.selectedVideoUrl ? 'video' : 'image'
            })
          )
          elements.push(
            createOverlayElement({
              id: generateElementId('overlay'),
              width,
              height
            })
          )
        }

        elements.push(headingElement)

        if (step.content) {
          elements.push(
            createTextElement({
              id: generateElementId('body'),
              text: step.body || step.content,
              x: width * 0.1,
              y: height * 0.35,
              width: width * 0.8,
              height: height * 0.45,
              fontSize: Math.max(32, width * 0.042),
              align: 'left',
              fontFamily: 'Inter',
              fontWeight: 'normal',
              fill: '#ffffff',
              lineHeight: 1.4
            })
          )
        }

        return {
          id: generateElementId('page'),
          name: step.heading.slice(0, 40) || `Step ${index + 1}`,
          children: elements,
          // background: '#0f172a',
          background:'linear-gradient(0deg, rgba(31,29,29,1) 0%,rgba(255,0,0,1) 100%)',
          bleed: 0,
          duration: 5000,
          width,
          height
        }
      })
    : (() => {
        const sections = splitContentIntoSections(rawContent)
        const normalizedSections = sections.length > 0 ? sections : [rawContent]

        return normalizedSections.map((section, index) => {
          const { heading, body } = extractHeadingAndBody(section)
          const headingText = heading || `Page ${index + 1}`
          const bodyText = body && body.length > 0 ? body : ''

          const headingElement = createTextElement({
            id: generateElementId('heading'),
            text: headingText,
            x: width * 0.1,
            y: height * 0.12,
            width: width * 0.8,
            height: Math.max(200, height * 0.25),
            fontSize: Math.min(Math.max(width * 0.08, 56), 100),
            align: 'center',
            fontFamily: 'Playfair Display',
            fontWeight: 'bold',
            fill: '#ffffff',
            lineHeight: 1.2
          })

          const elements: DesignElement[] = [headingElement]

          if (bodyText) {
            elements.push(
              createTextElement({
                id: generateElementId('body'),
                text: bodyText,
                x: width * 0.1,
                y: height * 0.35,
                width: width * 0.8,
                height: height * 0.5,
                fontSize: Math.max(34, width * 0.044),
                align: 'left',
                fontFamily: 'Inter',
                fontWeight: 'normal',
                fill: '#ffffff',
                lineHeight: 1.4
              })
            )
          }

          return {
            id: generateElementId('page'),
            name: `Page ${index + 1}`,
            children: elements,
            background: '#0f172a',
            bleed: 0,
            duration: 5000,
            width,
            height
          }
        })
      })()

  return {
    design: {
      width,
      height,
      fonts: [],
      pages,
      audios: [],
      unit: 'px',
      dpi: 72
    },
    meta: {
      primarySelection,
      pageCount: pages.length,
      width,
      height,
      usesStructuredSteps: hasStructuredSteps,
      stepTitles: hasStructuredSteps
        ? normalizedSteps.map((step) => step.heading)
        : []
    }
  }
}

export default function NewPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedContext, setSelectedContext] = useState<string>('')
  const [selectedContextDetail, setSelectedContextDetail] =
    useState<string>('')
  const [collapsedTiles, setCollapsedTiles] = useState<boolean>(false)
  const [isContextContainerHidden, setIsContextContainerHidden] = useState<boolean>(false)
  const [highlightedCategory, setHighlightedCategory] = useState<string>('')
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [isAnimationStopped, setIsAnimationStopped] = useState<boolean>(false)
  const [selectedOutputs] = useState<SelectedOutputsMap>({})
  const [isTilesContainerHovered, setIsTilesContainerHovered] = useState<boolean>(false)

  const selectedContextOptions =
    contextDetailOptions[selectedContext] ?? []

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [unsplashApiKey, setUnsplashApiKey] = useState('')
  const [textContent, setTextContent] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiError, setAiError] = useState<{
    message: string
    isNetworkError: boolean
  } | null>(null)
  const [editableSteps, setEditableSteps] = useState<GeneratedStepContent[]>([])
  const [conversationMap, setConversationMap] = useState<ConversationMap | null>(null)
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null)
  const [editingStepIndices, setEditingStepIndices] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageAttachments, setImageAttachments] = useState<string[]>([])
  const [unsplashImages, setUnsplashImages] = useState<Record<string, string[]>>({})
  const [, setLoadingUnsplashSteps] = useState<Set<string>>(new Set())
  const [loadingSession, setLoadingSession] = useState<string | null>(null)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [imageAnalysisResults, setImageAnalysisResults] = useState<ImageAnalysisResult[]>([])
  const hasPendingImageAnalysis = useMemo(
    () =>
      imageAttachments.length > 0 &&
      (imageAnalysisResults.length < imageAttachments.length ||
        imageAnalysisResults.some((result) => result?.isAnalyzing)),
    [imageAttachments, imageAnalysisResults]
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false)
  const [personaSettings, setPersonaSettings] = useState({
    personaName: '',
    audienceDescription: '',
    tone: '',
    goals: ''
  })
  const {
    savedSessions,
    currentSessionId,
    setCurrentSessionId,
    totalTokensUsed,
    setTotalTokensUsed,
    isTokensUpdated,
    setIsTokensUpdated,
    saveSession,
    updateTokens,
    deleteSession
  } = useNewPageSession()
  const [selectedImageForDetails, setSelectedImageForDetails] = useState<
    number | null
  >(null)
  const [showAllIdeas, setShowAllIdeas] = useState(false)
  const [animatingSuggestion, setAnimatingSuggestion] = useState<{
    analysisIndex: number
    ideaIndex: number
  } | null>(null)
  const [animatingTextarea, setAnimatingTextarea] = useState(false)
  const [hidingSuggestionsCarousel, setHidingSuggestionsCarousel] = useState(false)
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(
    new Set()
  )
  const [showTestimonialBackground, setShowTestimonialBackground] =
    useState(true)
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const hasPrefilledKitchenSink = useRef(false)
  // Toggle X-ray mode (Cmd+Shift+X) to show minimalistic component labels from data-id
  useEffect(() => {
    const getPageRoot = (): Element =>
      (document.querySelector('[data-id="PageRoot"]') as Element) || document.body

    const removeXrayLabels = (root: Element) => {
      root.querySelectorAll('.xray-label').forEach((label) => label.remove())
    }

    const copyText = async (text: string) => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          return
        }
      } catch (error) {
        console.warn('Falling back to execCommand clipboard copy:', error)
      }
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textarea)
      }
    }

    const attachXrayLabels = (root: Element) => {
      const elements = root.querySelectorAll('[data-id]')
      elements.forEach((el) => {
        const host = el as HTMLElement
        if (host.querySelector(':scope > .xray-label')) return
        const label = document.createElement('div')
        label.className = 'xray-label'
        const name = host.getAttribute('data-id') || ''
        label.textContent = name
        label.setAttribute('role', 'button')
        label.setAttribute('tabindex', '0')
        label.setAttribute('aria-label', `Copy component id ${name}`)
        const handleClick = (ev: MouseEvent) => {
          ev.stopPropagation()
          void copyText(name)
        }
        const handleKey = (ev: KeyboardEvent) => {
          const key = ev.key.toLowerCase()
          if (key === 'enter' || key === ' ') {
            ev.preventDefault()
            ev.stopPropagation()
            void copyText(name)
          }
        }
        label.addEventListener('click', handleClick)
        label.addEventListener('keydown', handleKey as unknown as EventListener)
        host.insertBefore(label, host.firstChild)
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey || !event.shiftKey) return
      if (event.key.toLowerCase() !== 'x') return
      const target = event.target as HTMLElement | null
      if (target && target.closest('input, textarea, [contenteditable="true"]')) return
      document.documentElement.classList.toggle('xray-on')
      const root = getPageRoot()
      if (document.documentElement.classList.contains('xray-on')) {
        attachXrayLabels(root)
      } else {
        removeXrayLabels(root)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    // If xray is already on (hot reload), ensure labels exist
    if (document.documentElement.classList.contains('xray-on')) {
      attachXrayLabels(getPageRoot())
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleStepContentChange = useCallback((index: number, value: string) => {
    setEditableSteps((prev) => {
      if (!prev[index]) return prev
      const updated = [...prev]
      updated[index] = { ...updated[index], content: value }
      return updated
    })
  }, [])

  // Create stable handlers for step interactions to prevent re-renders
  const stepHandlers = useMemo(() => {
    const handlers: Record<
      number,
      {
        onContentChange: (value: string) => void
        onFocus: () => void
        onExitEditMode: () => void
      }
    > = {}

    editableSteps.forEach((_, index) => {
      handlers[index] = {
        onContentChange: (value: string) =>
          handleStepContentChange(index, value),
        onFocus: () => {
          setEditingStepIndices((previous) => new Set([...previous, index]))
        },
        onExitEditMode: () => {
          setEditingStepIndices((previous) => {
            const next = new Set(previous)
            next.delete(index)
            return next
          })
        }
      }
    })

    return handlers
  }, [editableSteps.length, handleStepContentChange])

  const conversationMapForDisplay = useMemo<ConversationMap>(
    () =>
      conversationMap ?? {
        flow: null,
        steps: []
      },
    [conversationMap]
  )

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jesus-film-studio-openai-api-key')
      const savedUnsplashApiKey = localStorage.getItem(
        'jesus-film-studio-unsplash-api-key'
      )
      if (savedUnsplashApiKey) {
        setUnsplashApiKey(savedUnsplashApiKey)
      }
    }
  }, [])

  // Save Unsplash API key to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && unsplashApiKey) {
      localStorage.setItem('jesus-film-studio-unsplash-api-key', unsplashApiKey)
    }
  }, [unsplashApiKey])

  // Intersection Observer for lazy loading Unsplash images
  const loadImagesWhenVisible = (step: GeneratedStepContent, stepIndex: number) => {
    if (selectedContext === 'Conversations') return

    const accessKey = unsplashApiKey || process.env.UNSPLASH_ACCESS_KEY
    if (accessKey && accessKey.length >= 40 && step.keywords && step.keywords.length > 0) {
      void loadUnsplashImagesForStep(step, stepIndex)
    }
  }

  // Collapse tiles when a chat context is selected
  useEffect(() => {
    setCollapsedTiles(selectedContextDetail !== '')
  }, [selectedContextDetail])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // Temporarily allow overflow to calculate proper scrollHeight
      const originalOverflow = textarea.style.overflow
      textarea.style.overflow = 'hidden'
      textarea.style.height = 'auto'
      // Calculate height based on scrollHeight with a small buffer
      const newHeight = Math.max(textarea.scrollHeight, 40) // Minimum height of 40px
      textarea.style.height = newHeight + 'px'
      // Restore original overflow setting
      textarea.style.overflow = originalOverflow
    }
  }

  // Flash token widget when updated
  useEffect(() => {
    if (totalTokensUsed.input > 0 || totalTokensUsed.output > 0) {
      setIsTokensUpdated(true)
      const timer = setTimeout(() => setIsTokensUpdated(false), 1000) // Flash for 1 second
      return () => clearTimeout(timer)
    }
  }, [totalTokensUsed])

  // Adjust height when text content changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [textContent])

  // Adjust height when window resizes (in case font loading affects height)
  useEffect(() => {
    const handleResize = () => {
      adjustTextareaHeight()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (router.pathname !== '/kitchensink-new') return
    if (hasPrefilledKitchenSink.current) return

    let isCancelled = false

    const prefillKitchenSink = async (): Promise<void> => {
      try {
        const module = await import('../src/data/kitchensink-new.json')
        if (isCancelled) return

        const data = module.default as KitchenSinkData

        if (data.selectedContext) {
          setSelectedContext(data.selectedContext)
        }
        if (data.selectedContextDetail) {
          setSelectedContextDetail(data.selectedContextDetail)
        }

        setTextContent(data.prompt)
        if (textareaRef.current) {
          textareaRef.current.value = data.prompt
        }

        setPersonaSettings(data.personaSettings)
        setAiResponse(data.aiResponse)
        setEditableSteps(Array.isArray(data.editableSteps) ? data.editableSteps : [])
        setConversationMap(data.conversationMap ?? null)
        setImageAttachments(data.imageAttachments ?? [])
        setImageAnalysisResults(
          Array.isArray(data.imageAnalysisResults)
            ? data.imageAnalysisResults.map((result) => ({
                ...result,
                isAnalyzing: result.isAnalyzing ?? false
              }))
            : []
        )
        setTotalTokensUsed(
          data.tokensUsed ?? {
            input: 0,
            output: 0
          }
        )
      } catch (error) {
        console.error('Failed to load kitchensink data', error)
      }
    }

    void prefillKitchenSink()
    hasPrefilledKitchenSink.current = true

    return () => {
      isCancelled = true
    }
  }, [router.pathname, setTotalTokensUsed])

  useEffect(() => {
    if (copiedStepIndex === null) return

    const timeout = setTimeout(() => setCopiedStepIndex(null), 2000)
    return () => clearTimeout(timeout)
  }, [copiedStepIndex])

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleContextChange = useCallback((context: string) => {
    setSelectedContext(context)
    setSelectedContextDetail('')
    setIsContextContainerHidden(true)
    setHighlightedCategory('') // Stop automatic highlight animation when a tile is selected
    setIsAnimationStopped(true) // Stop the rotating text animation
    setHidingSuggestionsCarousel(false) // Show suggestions carousel when switching contexts
    setConversationMap(null)
  }, [])

  // Memoized callback to prevent unnecessary re-renders of RotatingText
  const handleCategoryChange = useCallback((category: string) => {
    setHighlightedCategory(category)
  }, [])

  // Helper function to determine if a tile should show hover effects
  const shouldShowHoverEffect = (category: string) => {
    // If no tile is being hovered, show hover effects for all tiles
    if (!isHovering) return true
    // If a tile is being hovered, only show hover effect for that specific tile
    return hoveredCategory === category
  }

  // Removed - using proper conversation history instead

  const buildConversationHistory = (): Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }> => {
    const messages: Array<{
      role: 'system' | 'user' | 'assistant'
      content: string
    }> = []

    // Build system message with base instructions and context-aware guidance
    const contextPrompt =
      contextSystemPrompts[selectedContext] ?? contextSystemPrompts.default

    const outputInstructions = getOutputFormatInstructions(selectedContext)
    const responseGuidelines = getResponseGuidelines(selectedContext)

    let systemPrompt = [
      BASE_SYSTEM_PROMPT,
      REFINEMENT_INSTRUCTIONS,
      `Context focus:\n${contextPrompt}`,
      outputInstructions,
      responseGuidelines
    ].join('\n\n')

    // Add image analysis context if available
    if (imageAnalysisResults.length > 0) {
      let imageContext = '\n\nCurrent session includes analyzed images:\n'
      imageAnalysisResults.forEach((analysis, imgIndex) => {
        imageContext += `\nImage ${imgIndex + 1} (${analysis.contentType}):\n`
        if (analysis.extractedText) {
          imageContext += `  Text: ${analysis.extractedText}\n`
        }
        if (analysis.contentIdeas && analysis.contentIdeas.length > 0) {
          imageContext += `  Content Ideas: ${analysis.contentIdeas.join(', ')}\n`
        }
        if (analysis.detailedDescription) {
          imageContext += `  Description: ${analysis.detailedDescription}\n`
        }
      })
      systemPrompt += imageContext
    }

    messages.push({
      role: 'system',
      content: systemPrompt
    })

    // Add current session conversation history
    if (textContent && aiResponse) {
      // Add the original user input
      messages.push({
        role: 'user',
        content: textContent
      })

      // Add the AI's previous response
      messages.push({
        role: 'assistant',
        content: aiResponse
      })
    }

    return messages
  }

  const parseGeneratedResponse = useCallback(
    (
      rawContent: string
    ): { steps: GeneratedStepContent[]; conversationMap?: ConversationMap } => {
      if (!rawContent) {
        return {
          steps: [],
          conversationMap:
            selectedContext === 'Conversations'
              ? normalizeConversationMap({})
              : undefined
        }
      }

      let preparedContent = rawContent.trim()
      const codeBlockMatch = preparedContent.match(/```(?:json)?\s*([\s\S]*?)```/i)
      if (codeBlockMatch?.[1]) {
        preparedContent = codeBlockMatch[1].trim()
      }

      try {
        const parsed = JSON.parse(preparedContent)

        if (selectedContext === 'Conversations') {
          const conversationData =
            parsed?.conversationMap && typeof parsed.conversationMap === 'object'
              ? parsed.conversationMap
              : parsed

          return {
            steps: [],
            conversationMap: normalizeConversationMap(conversationData)
          }
        }

        const stepsArray = Array.isArray(parsed?.steps)
          ? parsed.steps
          : Array.isArray(parsed)
            ? parsed
            : []

        if (Array.isArray(stepsArray) && stepsArray.length > 0) {
          return { steps: normalizeGeneratedSteps(stepsArray as GeneratedStepContent[]) }
        }

        if (parsed?.steps && typeof parsed.steps === 'string') {
          try {
            const nestedSteps = JSON.parse(parsed.steps)
            if (Array.isArray(nestedSteps) && nestedSteps.length > 0) {
              return { steps: normalizeGeneratedSteps(nestedSteps) }
            }
          } catch (nestedError) {
            console.warn('Failed to parse nested steps JSON:', nestedError)
          }
        }
      } catch (error) {
        console.warn(
          'Failed to parse structured multi-step content. Falling back to default format.',
          error
        )
      }

      if (selectedContext === 'Conversations') {
        return { steps: [], conversationMap: normalizeConversationMap({}) }
      }

      const fallbackSteps: GeneratedStepContent[] = []
      const stepRegex = /(Step\s+\d+\s*[:-]?)([\s\S]*?)(?=(?:\nStep\s+\d+\s*[:-]?\b)|$)/gi
      let match = stepRegex.exec(preparedContent)
      if (match) {
        stepRegex.lastIndex = 0
        let fallbackIndex = 0
        while ((match = stepRegex.exec(preparedContent)) !== null) {
          const [, rawTitle, rawBody] = match
          const normalizedTitle =
            rawTitle?.replace(/[:-]+$/, '').trim() || `Step ${fallbackIndex + 1}`
          const normalizedBody = rawBody?.trim() || ''
          fallbackSteps.push({
            content: normalizedTitle
              ? `# ${normalizedTitle}\n\n${normalizedBody}`.trim()
              : normalizedBody,
            keywords: [],
            mediaPrompt: ''
          })
          fallbackIndex += 1
        }
      }

      if (fallbackSteps.length > 0) {
        return { steps: normalizeGeneratedSteps(fallbackSteps) }
      }

      return {
        steps: normalizeGeneratedSteps([
          {
            content: rawContent.trim(),
            keywords: [],
            mediaPrompt: ''
          }
        ])
      }
    },
    [selectedContext]
  )

  const handleCopyStep = async (
    content: string,
    index: number
  ): Promise<void> => {
    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard) {
        await navigator.clipboard.writeText(content)
        setCopiedStepIndex(index)
      } else {
        throw new Error('Clipboard API unavailable')
      }
    } catch (error) {
      console.error('Failed to copy step content:', error)
      console.warn('Unable to copy content automatically. Please copy manually.')
    }
  }

  const extractTextFromResponse = (result: unknown): string => {
    if (result == null || typeof result !== 'object') {
      return ''
    }

    const resultRecord = result as Record<string, unknown>

    const outputText = resultRecord.output_text
    if (typeof outputText === 'string' && outputText.trim().length > 0) {
      return outputText
    }

    const output = resultRecord.output
    if (Array.isArray(output)) {
      for (const rawItem of output) {
        if (!rawItem || typeof rawItem !== 'object') continue
        const item = rawItem as Record<string, unknown>
        const content = item.content
        if (Array.isArray(content)) {
          const textPart = content.find(
            (part): part is { type: string; text?: string } =>
              typeof part === 'object' &&
              part !== null &&
              (part as Record<string, unknown>).type === 'output_text' &&
              typeof (part as Record<string, unknown>).text === 'string'
          )
          if (textPart?.text?.trim()) {
            return textPart.text
          }
        }
      }
    }

    return ''
  }

  const accumulateUsage = (usage: unknown) => {
    if (!usage || typeof usage !== 'object') return

    const usageRecord = usage as Record<string, unknown>

    const newTokens = {
      input: typeof usageRecord.input_tokens === 'number' ? usageRecord.input_tokens : 0,
      output: typeof usageRecord.output_tokens === 'number' ? usageRecord.output_tokens : 0
    }

    updateTokens(currentSessionId, newTokens)
  }

  const handleAiError = useCallback(
    (
      _error: unknown,
      errorMeta?: { isNetworkError: boolean }
    ) => {
      const isNetworkError = errorMeta?.isNetworkError ?? false
      setAiError({
        isNetworkError,
        message: isNetworkError
          ? 'We had trouble reaching the Studio AI service. Check your connection and try again.'
          : 'Something went wrong while generating content. Please try again.'
      })
    },
    [setAiError]
  )

  const {
    isStreaming,
    text: streamingText,
    usage: streamingUsage,
    error: streamingError,
    conversationMap: streamingConversationMap,
    steps: streamingSteps,
    startStream
  } = useAiStream()

  // Handle streaming updates and completion
  useEffect(() => {
    if (selectedContext === 'Conversations') {
      if (isStreaming) {
        setAiResponse(streamingText)
      }

      if (streamingConversationMap) {
        try {
          const normalized = normalizeConversationMap(streamingConversationMap)
          setConversationMap(normalized)
        } catch (error) {
          if (isDebugLoggingEnabled) {
            console.debug('[Streaming] Ignoring conversation map parse error:', error)
          }
        }
      }

      if (!isStreaming) {
        if (streamingText && streamingUsage) {
          setIsProcessing(false)

          const parsed = parseGeneratedResponse(streamingText)
          setEditableSteps(parsed.steps)
          setConversationMap(parsed.conversationMap || null)
          setAiResponse(streamingText)

          const sessionId = saveSession({
            textContent,
            images: imageAttachments,
            aiResponse: streamingText,
            aiSteps: parsed.steps,
            conversationMap: parsed.conversationMap || null,
            imageAnalysisResults: imageAnalysisResults.map((result) => ({
              imageSrc: result.imageSrc,
              contentType: result.contentType,
              extractedText: result.extractedText,
              detailedDescription: result.detailedDescription,
              confidence: result.confidence,
              contentIdeas: result.contentIdeas
            })),
            tokensUsed: {
              input: streamingUsage.input_tokens,
              output: streamingUsage.output_tokens
            }
          })

          updateTokens(sessionId, {
            input: streamingUsage.input_tokens,
            output: streamingUsage.output_tokens
          })
        } else if (!streamingText && !streamingConversationMap) {
          setIsProcessing(false)
        }
      }
    } else {
      if (isStreaming) {
        setAiResponse(streamingText)

        if (streamingSteps) {
          try {
            const stepsRecord = streamingSteps as Record<string, unknown>
            const rawSteps = Array.isArray(stepsRecord)
              ? stepsRecord
              : Array.isArray(stepsRecord.steps)
                ? stepsRecord.steps
                : []

            if (Array.isArray(rawSteps) && rawSteps.length > 0) {
              const normalizedSteps = normalizeGeneratedSteps(
                rawSteps as GeneratedStepContent[]
              )
              setEditableSteps(normalizedSteps)
            }
          } catch (error) {
            if (isDebugLoggingEnabled) {
              console.debug('[Streaming] Ignoring steps normalization error:', error)
            }
          }
        }

        if (streamingText && !streamingSteps) {
          try {
            const parsedSteps = parseGeneratedResponse(streamingText)
            setEditableSteps(parsedSteps.steps)
            setConversationMap(parsedSteps.conversationMap || null)
          } catch (error) {
            if (isDebugLoggingEnabled) {
              console.debug('[Streaming] Ignoring parse error during streaming:', error)
            }
          }
        }
      } else if (streamingText && streamingUsage) {
        setIsProcessing(false)

        const parsedSteps = parseGeneratedResponse(streamingText)
        setEditableSteps(parsedSteps.steps)
        setConversationMap(parsedSteps.conversationMap || null)

        const sessionId = saveSession({
          textContent: textContent,
          images: imageAttachments,
          aiResponse: streamingText,
          aiSteps: parsedSteps.steps,
          imageAnalysisResults: imageAnalysisResults.map((result) => ({
            imageSrc: result.imageSrc,
            contentType: result.contentType,
            extractedText: result.extractedText,
            detailedDescription: result.detailedDescription,
            confidence: result.confidence,
            contentIdeas: result.contentIdeas
          })),
          tokensUsed: {
            input: streamingUsage.input_tokens,
            output: streamingUsage.output_tokens
          }
        })

        updateTokens(sessionId, {
          input: streamingUsage.input_tokens,
          output: streamingUsage.output_tokens
        })
      } else if (!isStreaming && !streamingText) {
        setIsProcessing(false)
      }
    }

    if (streamingError) {
      handleAiError(new Error(streamingError))
    }
  }, [
    isStreaming,
    streamingText,
    streamingUsage,
    streamingError,
    streamingConversationMap,
    streamingSteps,
    selectedContext,
    saveSession,
    updateTokens,
    textContent,
    imageAttachments,
    imageAnalysisResults,
    parseGeneratedResponse,
    normalizeGeneratedSteps,
    handleAiError
  ])

  const { analyzeImageWithAI } = useImageAnalysis({
    setImageAnalysisResults,
    extractTextFromResponse,
    accumulateUsage,
    prompt: IMAGE_ANALYSIS_PROMPT
  })

  const { loadUnsplashImagesForStep, testUnsplashAPI } =
    useUnsplashMedia({
      unsplashApiKey,
      unsplashImages,
      setUnsplashImages,
      setLoadingUnsplashSteps,
      setIsSettingsOpen,
      deriveHeadingFromContent
    })

  // Expose test function to window for debugging
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    Object.assign(window, { testUnsplashAPI })

    return () => {
      delete (window as typeof window & { testUnsplashAPI?: typeof testUnsplashAPI }).testUnsplashAPI
    }
  }, [testUnsplashAPI])

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) return

    imageFiles.forEach((file, fileIndex) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        console.warn(
          `File ${file.name} is too large. Please use images smaller than 10MB.`
        )
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          const currentIndex = imageAttachments.length + fileIndex
          setImageAttachments((prev) => [...prev, result])
          // Trigger image analysis
          void analyzeImageWithAI(result, currentIndex)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          processFiles([file])
        }
      }
    }
  }

  const removeImage = (index: number) => {
    setImageAttachments((prev) => prev.filter((_, i) => i !== index))
    setImageAnalysisResults((prev) => prev.filter((_, i) => i !== index))
  }

  const handleOpenCamera = () => {
    cameraInputRef.current?.click()
  }

  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  const handlePersonaFieldChange = (
    field: keyof typeof personaSettings
  ) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value = event.target.value
      setPersonaSettings((prev) => ({
        ...prev,
        [field]: value
      }))
    }

  const handlePersonaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPersonaDialogOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (hasPendingImageAnalysis) {
      alert(
        'Please wait for all attached images to finish analysis before running the AI prompt.'
      )
      return
    }

    const currentValue = textareaRef.current?.value || ''

    if (!currentValue.trim() || isProcessing || isStreaming) {
      return
    }

    setAiError(null)
    // Update textContent state before processing
    setTextContent(currentValue)

    await handleStreamingSubmit(currentValue)
  }

  const handleStreamingSubmit = async (inputText: string) => {
    setIsProcessing(true)
    setAiResponse('')
    setEditableSteps([])
    setConversationMap(null)

    try {
      const messages = buildConversationHistory()
      const currentUserMessage = inputText.trim()
      messages.push({
        role: 'user',
        content: currentUserMessage
      })

      await startStream({
        messages,
        // Use OpenRouter by default, can be extended for Apologist
        provider: 'openrouter',
        mode: selectedContext === 'Conversations' ? 'conversation' : 'default'
      })

    } catch (error) {
      const networkError = isNetworkError(error)

      if (networkError) {
        console.warn('Network error while streaming content. Ready for retry.', error)
      } else {
        console.error('Error streaming content:', error)
      }

      handleAiError(error)
      setIsProcessing(false)
    }
  }

  const handleGenerateDesign = async () => {
    const baseContent = aiResponse.trim()

    if (!baseContent) {
      alert('Generate AI content in Step 1 before creating Studio designs.')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    setIsGeneratingDesign(true)

    try {
      const { design, meta } = createPolotnoDesignFromContent({
        rawContent: baseContent,
        selectedOutputs,
        steps: editableSteps
      })
      const timestamp = new Date().toISOString()
      const previewSource =
        editableSteps.length > 0
          ? editableSteps
              .map((step, index) => {
                const content = step?.content?.trim() || ''
                const heading = deriveHeadingFromContent(
                  content,
                  `Step ${index + 1}`
                )
                const body = deriveBodyFromContent(content)

                if (body) {
                  return `${heading}: ${body}`
                }

                if (content) {
                  return `${heading}: ${content}`
                }

                return heading
              })
              .filter((section) => section.length > 0)
              .join('\n\n')
          : baseContent
      const metadata = {
        ...meta,
        generatedAt: timestamp,
        selectedOutputs,
        contentPreview: previewSource.slice(0, 280)
      }

      window.localStorage.setItem(
        'studio-polotno-design',
        JSON.stringify(design)
      )
      window.localStorage.setItem(
        'studio-polotno-design-meta',
        JSON.stringify(metadata)
      )

      await router.push('/edit')
    } catch (error) {
      console.error('Failed to create Polotno design from AI content:', error)
      alert(
        'We were unable to prepare your designs for Studio. Please try again.'
      )
    } finally {
      setIsGeneratingDesign(false)
    }
  }

  // Helper function to get the content type for the header
  const getContentTypeForHeader = () => {
    const contentTypes = imageAnalysisResults
      .filter(
        (result) =>
          result.contentIdeas &&
          result.contentIdeas.length > 0 &&
          !result.isAnalyzing
      )
      .map((result) => result.contentType)
      .filter(Boolean)

    if (contentTypes.length === 0) return 'content'

    // If all content types are the same, use that type
    const uniqueTypes = [...new Set(contentTypes)]
    if (uniqueTypes.length === 1) {
      return uniqueTypes[0].replace(/_/g, ' ')
    }

    // If multiple types, use 'content' as generic term
    return 'content'
  }

  const loadSession = (session: UserInputData) => {
    // Start loading animation immediately
    setLoadingSession(session.id)
    setConversationMap(session.conversationMap ?? null)

    // After loading animation delay, load the session and collapse
    setTimeout(() => {
      // Stop loading animation
      setLoadingSession(null)

      // Start collapsing animation
      setIsCollapsing(true)

      // After collapse animation completes, hide the section
      setTimeout(() => {
        setIsSessionsOpen(false)
        setIsCollapsing(false)
      }, 500) // Match the CSS transition duration

      // Load session data
      setTextContent(session.textContent)
      setImageAttachments(session.images)
      setAiResponse(session.aiResponse || '')
      setEditableSteps(
        session.aiSteps ? normalizeGeneratedSteps(session.aiSteps) : []
      )
      // Set textarea value directly
      if (textareaRef.current) {
        textareaRef.current.value = session.textContent
      }
      setImageAnalysisResults(
        session.imageAnalysisResults.map((result) => ({
          ...result,
          contentIdeas: result.contentIdeas || [],
          isAnalyzing: false
        }))
      )

      // Set current session ID for token tracking
      setCurrentSessionId(session.id)

      // Set token usage for display
      if (session.tokensUsed) {
        setTotalTokensUsed(session.tokensUsed)
      }

      // Clear draft since we're loading a saved session
      userInputStorage.clearDraft()

      // Scroll to "Parsed Multi-Step Content" section
      setTimeout(() => {
        const element = document.getElementById('parsed-multi-step-content')
        if (element) {
          // Custom smooth scroll with slower animation
          const elementTop = element.getBoundingClientRect().top
          const startPosition = window.pageYOffset
          const distance = elementTop - 20 // Small offset from top
          const duration = 800 // 800ms for slower scroll
          let startTime: number | null = null

          const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime
            const timeElapsed = currentTime - startTime
            const progress = Math.min(timeElapsed / duration, 1)

            // Easing function for smoother animation
            const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
            const run = easeInOutCubic(progress)

            window.scrollTo(0, startPosition + distance * run)

            if (timeElapsed < duration) {
              requestAnimationFrame(animation)
            }
          }

          requestAnimationFrame(animation)
        }
      }, 300)
    }, 800) // 0.8 second loading animation
  }

  return (
    <>
      <Head data-id="Head">
        <title>Create New Content | Studio | Jesus Film Project</title>
      </Head>
      <div className="min-h-screen bg-stone-100 text-foreground" data-id="PageRoot">
        <header className="border-b border-border bg-background backdrop-blur relative z-100" data-id="Header">
          <div className="container mx-auto px-4 py-6" data-id="HeaderContainer">
            <div className="flex items-center justify-between" data-id="HeaderRow">
              <div className="flex items-center gap-4" data-id="HeaderBranding">
                <StudioSiteSelector onNavigateHome={() => {
                  void router.push('/')
                }} />
              </div>
              <div className="flex items-center gap-4" data-id="HeaderActions">
                {(totalTokensUsed.input > 0 || totalTokensUsed.output > 0) && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                      isTokensUpdated ? 'bg-red-500 text-white' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={
                        isTokensUpdated ? 'text-white' : 'text-muted-foreground'
                      }
                    >
                      Tokens:
                    </span>
                    <span className="font-medium">
                      {(() => {
                        const total =
                          totalTokensUsed.input + totalTokensUsed.output
                        if (total >= 1000000) {
                          return `${(total / 1000000).toFixed(1)}M`
                        } else if (total >= 1000) {
                          return `${(total / 1000).toFixed(1)}K`
                        }
                        return total.toLocaleString()
                      })()}
                    </span>
                    <span
                      className={
                        isTokensUpdated ? 'text-white' : 'text-muted-foreground'
                      }
                    >
                      •
                    </span>
                    <span className="font-medium">
                      $
                      {Math.max(
                        (totalTokensUsed.input / 1000000) * 0.05 +
                          (totalTokensUsed.output / 1000000) * 0.4,
                        0.01
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
                  onClick={() => setIsSessionsOpen(v => !v)}
                >
                  <History className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
                  <span className="sr-only">Sessions</span>
                </Button>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group"
                    >
                      <Settings className="!h-5 !w-5 group-hover:!text-primary transition-colors" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                      <DialogDescription>
                        Configure your API keys and preferences.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium">
                          OpenAI Access
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Responses are now powered by a secure, server-managed OpenAI connection. No personal API key is required.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="unsplash-api-key"
                          className="text-sm font-medium"
                        >
                          Unsplash Access Key
                        </label>
                        <Input
                          id="unsplash-api-key"
                          type="password"
                          placeholder="Enter your Unsplash Access Key..."
                          value={unsplashApiKey}
                          onChange={(e) => setUnsplashApiKey(e.target.value)}
                          className={`w-full ${unsplashApiKey && !/^[A-Za-z0-9_-]{40,80}$/.test(unsplashApiKey) ? 'border-red-500' : ''}`}
                        />
                        {unsplashApiKey && !/^[A-Za-z0-9_-]{40,80}$/.test(unsplashApiKey) && (
                          <p className="text-xs text-red-600 mt-1">
                            Access Key appears to be invalid format. Should be 40-80 characters.
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Your Unsplash Access Key is used to fetch relevant
                            images for content steps. Get one from{' '}
                            <a
                              href="https://unsplash.com/developers"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Unsplash Developers
                            </a>
                            . It will be stored locally in your browser.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={testUnsplashAPI}
                            className="ml-4 whitespace-nowrap"
                          >
                            Test Key
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* AI Analysis Details Dialog */}
                <Dialog
                  open={selectedImageForDetails !== null}
                  onOpenChange={() => setSelectedImageForDetails(null)}
                >
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>AI Image Analysis Details</DialogTitle>
                      <DialogDescription>
                        Detailed analysis of the selected image by AI
                      </DialogDescription>
                    </DialogHeader>
                    {selectedImageForDetails !== null &&
                      (() => {
                        const analysis =
                          imageAnalysisResults[selectedImageForDetails]
                        const imageSrc =
                          imageAttachments[selectedImageForDetails]
                        return (
                          <div className="space-y-6">
                            {/* Image preview */}
                            <div className="flex justify-center">
                              <div className="w-64 h-64 rounded-lg overflow-hidden bg-muted border">
                                <Image
                                  src={imageSrc}
                                  alt={`Image ${selectedImageForDetails + 1}`}
                                  width={256}
                                  height={256}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Analysis results */}
                            {analysis?.isAnalyzing ? (
                              <div className="flex items-center justify-center gap-2 py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <span>Analyzing image...</span>
                              </div>
                            ) : analysis ? (
                              <div className="space-y-4">
                                {/* Content type and confidence */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium">
                                    Content Type:
                                  </span>
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full ${
                                      analysis.contentType === 'bible_picture'
                                        ? 'bg-blue-100 text-blue-800'
                                        : analysis.contentType ===
                                            'devotional_picture'
                                          ? 'bg-green-100 text-green-800'
                                          : analysis.contentType ===
                                              'church_service_slide'
                                            ? 'bg-purple-100 text-purple-800'
                                            : analysis.contentType ===
                                                'scripture_verse'
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {analysis.contentType
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full ml-2 ${
                                      analysis.confidence === 'high'
                                        ? 'bg-green-100 text-green-800'
                                        : analysis.confidence === 'medium'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-primary/10 text-primary'
                                    }`}
                                  >
                                    {analysis.confidence} confidence
                                  </span>
                                </div>

                                {/* Extracted text */}
                                {analysis.extractedText && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Extracted Text:
                                    </h4>
                                    <div className="p-3 bg-muted rounded-lg border">
                                      <p className="text-sm font-mono whitespace-pre-wrap">
                                        {analysis.extractedText}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Content ideas */}
                                {Array.isArray(analysis.contentIdeas) &&
                                  analysis.contentIdeas.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">
                                        Content Ideas:
                                      </h4>
                                      <div className="space-y-2">
                                        {analysis.contentIdeas.map(
                                          (idea, ideaIndex) => (
                                            <div
                                              key={ideaIndex}
                                              className="text-xs px-3 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
                                            >
                                              {typeof idea === 'string'
                                                ? idea
                                                : JSON.stringify(idea)}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Detailed description */}
                                {analysis.detailedDescription && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Detailed Description:
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {analysis.detailedDescription}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>
                                  No analysis available. Try again once the AI proxy finishes processing, or re-run the analysis.
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                  </DialogContent>
                </Dialog>

                {/* See All Ideas Dialog */}
                <Dialog open={showAllIdeas} onOpenChange={setShowAllIdeas}>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        All Content Ideas for {getContentTypeForHeader()}
                      </DialogTitle>
                      <DialogDescription>
                        Click any idea below to add it to your content. These
                        ideas are tailored to your uploaded images.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {imageAnalysisResults
                        .filter(
                          (result) =>
                            result.contentIdeas &&
                            result.contentIdeas.length > 0 &&
                            !result.isAnalyzing
                        )
                        .map((analysis, analysisIndex) => (
                          <div key={analysisIndex} className="space-y-3">
                            {analysisIndex > 0 && (
                              <hr className="border-border" />
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border flex-shrink-0">
                                <Image
                                  src={analysis.imageSrc}
                                  alt={`Image ${analysisIndex + 1}`}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                Ideas from Image {analysisIndex + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Array.isArray(analysis.contentIdeas) &&
                                analysis.contentIdeas.map((idea, ideaIndex) => {
                                  const suggestionKey = `modal-${analysisIndex}-${ideaIndex}`
                                  if (hiddenSuggestions.has(suggestionKey))
                                    return null

                                  return (
                                    <div
                                      key={ideaIndex}
                                      data-id="SuggestionTile"
                                      className={`relative p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white hover:border-gray-300 hover:shadow-sm ${
                                        animatingSuggestion?.analysisIndex ===
                                          analysisIndex &&
                                        animatingSuggestion?.ideaIndex ===
                                          ideaIndex
                                          ? 'animate-suggestion-disappear opacity-100'
                                          : 'transition-all duration-200'
                                      }`}
                                      onClick={() => {
                                        // Set animating state to start the disappear animation immediately
                                        setAnimatingSuggestion({
                                          analysisIndex,
                                          ideaIndex
                                        })

                                        // After suggestion animation completes (500ms), add text and hide the suggestion
                                        setTimeout(() => {
                                          const currentText = textContent
                                          const newText = currentText
                                            ? `${currentText}\n\n${idea}`
                                            : idea
                                          setTextContent(newText)
                                          // Update textarea value directly
                                          if (textareaRef.current) {
                                            textareaRef.current.value = newText
                                          }
                                          setAnimatingTextarea(true)
                                          setHiddenSuggestions((prev) =>
                                            new Set(prev).add(suggestionKey)
                                          ) // Hide this suggestion permanently
                                          setAnimatingSuggestion(null) // Clear animation state

                                          // Reset textarea animation after it completes (800ms)
                                          setTimeout(() => {
                                            setAnimatingTextarea(false)
                                            setShowAllIdeas(false) // Close modal after both animations complete
                                          }, 800)
                                        }, 500) // Match suggestion disappear animation duration
                                      }}
                                    >
                                      <p className="text-sm text-gray-800 leading-relaxed">
                                        {typeof idea === 'string'
                                          ? idea
                                          : JSON.stringify(idea)}
                                      </p>
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Stepper */}
        <div className="border-b border-border bg-stone-100 hidden" data-id="Stepper">
          <div className="container mx-auto px-4 py-6" data-id="StepperContainer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        step.id <= currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white text-muted-foreground shadow-sm'
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          step.id === currentStep
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 h-px mx-4 ${
                          step.id < currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Sessions */}
        {isSessionsOpen && savedSessions.length > 0 && (
          <div className={`max-w-4xl mx-auto mb-8 transition-all duration-500 ease-in-out ${
            isCollapsing ? 'opacity-0 scale-95 transform' : 'opacity-100 scale-100'
          }`}>
            <div className="border border-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Previous Sessions</span>
              </div>
              <div className="space-y-3">
                {savedSessions.map((session, index) => (
                  <React.Fragment key={session.id}>
                    <Card
                      className={`group p-3 relative border-muted bg-transparent shadow-none hover:bg-white hover:shadow-md hover:-my-3 hover:py-7 hover:z-10 transition-padding duration-200 ease-out cursor-pointer ${
                        loadingSession === session.id ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => !loadingSession && loadSession(session)}
                    >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 text-center min-w-0">
                        <div className="text-sm font-semibold text-muted-foreground leading-tight">
                          {new Date(session.timestamp).getDate()}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                          {new Date(session.timestamp).toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {session.textContent.substring(0, 60)}...
                          </h4>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>
                            {session.images.length > 0
                              ? `${session.images.length} images • `
                              : `${new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • `}
                              {(() => {
                                const tokens = session.tokensUsed
                                if (!tokens) return ''
                                const hasTokens = tokens.input > 0 || tokens.output > 0
                                if (!hasTokens) return ''

                                const total = tokens.input + tokens.output
                                const formattedTotal = (() => {
                                  if (total >= 1000000) {
                                    return `${(total / 1000000).toFixed(1)}M`
                                  }
                                  if (total >= 1000) {
                                    return `${(total / 1000).toFixed(1)}K`
                                  }
                                  return total.toLocaleString()
                                })()

                                const cost =
                                  (tokens.input / 1000000) * 0.05 + (tokens.output / 1000000) * 0.4
                                const formattedCost = cost >= 0.01 ? cost.toFixed(2) : '0.00'

                                return `Tokens: ${formattedTotal} • $${formattedCost}`
                              })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {loadingSession === session.id ? (
                          <div className="flex items-center gap-2 px-2 py-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-xs text-muted-foreground">Loading...</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation() // Prevent triggering the card click
                              deleteSession(session.id)
                            }}
                            className="invisible group-hover:visible h-7 px-2 text-xs text-primary hover:!bg-primary hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    </Card>
                    {index < savedSessions.length - 1 && (
                      <hr className="border-stone-600/10 my-2 mx-4 z-1 relative" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        <main
          data-id="Main"
          className="container mx-auto px-4 py-6 relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-stone-700" />
                <p className="text-xl font-medium ">Drop images to upload</p>
              </div>
            </div>
          )}
          {/* Step 1: Content */}
          {currentStep === 1 && (
            <>
              <div className={`max-w-4xl mx-auto transition-all duration-500 ease-in-out}`} suppressHydrationWarning data-id="Step1Container">
                <div className="bg-transparent border-0 shadow-none">
                   
                  <div
                  className={`relative w-full transition-[max-height] duration-700 ease-out pt-0 ${
                    isContextContainerHidden
                      ? 'opacity-0 max-h-0 py-0 pointer-events-none md:pt-10'
                      : 'opacity-100 max-h-100  '
                  }`}>
                    <div className="flex items-start justify-between md:mb-4" data-id="HeroRow">
                      <blockquote className="text-xl font-semibold md:font-semibold text-stone-950 text-balance w-full text-center z-30 animate-bible-quote-appear md:py-12 py-2" data-id="Verse">
                        &ldquo;Let your conversation be always{' '}
                        <span className="animate-gradient-wave animate-glow-delay">full&nbsp;of&nbsp;grace,
                        seasoned&nbsp;with&nbsp;salt</span>, so&nbsp;that&nbsp;you&nbsp;may know how to
                        answer everyone.&rdquo;
                        <cite className="block mt-2 text-sm font-medium text-stone-500">
                          Colossians 4:5–6
                        </cite>
                      </blockquote>
                      <p className="absolute block bottom-0 md:-bottom-40 text-center w-full text-sm font-medium text-stone-400 opacity-0 animate-fade-in-out [animation-delay:1200ms] z-100 uppercase tracking-widest" data-id="IntroLabel">
                        Introducing: <br />Sharing Studio...
                      </p>

                    {showTestimonialBackground && (
                      <div
                        data-testid="testimonial-background"
                        className="fixed inset-0 bg-stone-50 z-20 animate-background-dissolve"
                        onAnimationEnd={() =>
                          setShowTestimonialBackground(false)
                        }
                      />
                    )}
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <Button variant="outline" size="lg" asChild className="self-center md:self-auto md:size-sm block md:hidden my-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How it works
                        </Link>
                      </Button>
                      <div
                      data-id="HeroTitle"
                      className="text-xl text-left relative  font-semibold leading-[1.2] md:leading-1.2 py-4 md:py-6" 
                      >
                        Share God's grace… <RotatingText
                          onCategoryChange={handleCategoryChange}
                          hoveredCategory={hoveredCategory}
                          isHovering={isHovering}
                          isAnimationStopped={isAnimationStopped}
                        />
                      </div>
                      <Button variant="link" size="sm" asChild className="hidden md:inline-flex">
                        <Link href="/" className="hidden md:inline-flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How it works
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div data-testid="section-channels" className="space-y-6" data-id="ChannelsSection">
                    {/* Context Selector */}
                    <ContextSelector
                      selectedContext={selectedContext}
                      collapsedTiles={collapsedTiles}
                      isTilesContainerHovered={isTilesContainerHovered}
                      isHovering={isHovering}
                      highlightedCategory={highlightedCategory}
                      shouldShowHoverEffect={shouldShowHoverEffect}
                      handleContextChange={handleContextChange}
                      setHoveredCategory={setHoveredCategory}
                      setIsHovering={setIsHovering}
                      setIsTilesContainerHovered={setIsTilesContainerHovered}
                    />

                    <MainPromptBlock
                      selectedContext={selectedContext}
                      imageAttachments={imageAttachments}
                      imageAnalysisResults={imageAnalysisResults}
                      removeImage={removeImage}
                      setSelectedImageForDetails={setSelectedImageForDetails}
                      textareaRef={textareaRef}
                      animatingTextarea={animatingTextarea}
                      handlePaste={handlePaste}
                      setTextContent={setTextContent}
                      handleSubmit={handleSubmit}
                      isProcessing={isProcessing || isStreaming}
                      hasPendingImageAnalysis={hasPendingImageAnalysis}
                      handleOpenCamera={handleOpenCamera}
                      isPersonaDialogOpen={isPersonaDialogOpen}
                      setIsPersonaDialogOpen={setIsPersonaDialogOpen}
                      aiResponse={isStreaming ? streamingText : aiResponse}
                      personaSettings={personaSettings}
                      handlePersonaFieldChange={handlePersonaFieldChange}
                      handlePersonaSubmit={handlePersonaSubmit}
                    />
                    {aiError && (
                      <div
                        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-medium text-primary shadow-sm dark:border-primary dark:bg-primary/20 dark:text-primary-foreground"
                        role="status"
                        aria-live="polite"
                      >
                        <span>{aiError.message}</span>
                        {aiError.isNetworkError && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary/20 dark:border-primary dark:text-primary dark:hover:bg-primary/30"
                            onClick={() => {
                              setAiError(null)
                              void handleSubmit()
                            }}
                            disabled={isProcessing}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    )}
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraChange}
                  className="hidden"
                />
                    
                {SHOW_PRAYER_CAROUSEL && isProcessing && (
                  <PrayerCarousel
                    isActive={isProcessing}
                  />
                )}

                {/* Content Ideas Grid */}
                {imageAnalysisResults.some(
                      (result) =>
                        result.contentIdeas &&
                        result.contentIdeas.length > 0 &&
                        !result.isAnalyzing
                    ) && (
                      <div className="mt-12 opacity-0 animate-fade-in-up">
                        <div
                          className="hidden items-center justify-between mb-4 opacity-0 animate-fade-in-left"
                          style={{
                            animationDelay: '0.2s',
                            animationFillMode: 'forwards'
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            <label className="text-lg font-semibold hidden">
                              Need Ideas for your {getContentTypeForHeader()}?
                            </label>
                            <span className="text-xs text-muted-foreground">
                              Click any idea to add it to your content
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs cursor-pointer"
                            onClick={() => setShowAllIdeas(true)}
                          >
                            See All
                          </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {imageAnalysisResults.flatMap(
                            (analysis, imageIndex) =>
                              Array.isArray(analysis.contentIdeas)
                                ? analysis.contentIdeas
                                    .map((idea, ideaIndex) => {
                                      const globalIndex =
                                        imageAnalysisResults
                                          .slice(0, imageIndex)
                                          .reduce(
                                            (total, result) =>
                                              total +
                                              (result.contentIdeas?.length ||
                                                0),
                                            0
                                          ) + ideaIndex
                                      const suggestionKey = `main-${imageIndex}-${ideaIndex}`
                                      if (hiddenSuggestions.has(suggestionKey))
                                        return null

                                      return (
                                        <div
                                          key={`${imageIndex}-${ideaIndex}`}
                                          data-id="SuggestionTile"
                                          className={`relative w-fit px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:scale-102 ${
                                            animatingSuggestion?.analysisIndex ===
                                              imageIndex &&
                                            animatingSuggestion?.ideaIndex ===
                                              ideaIndex
                                              ? 'animate-suggestion-disappear'
                                              : 'opacity-0 animate-fade-in-up transition-all duration-300'
                                          }`}
                                          style={{
                                            animationDelay: `${0.4 + globalIndex * 0.1}s`,
                                            animationFillMode: 'forwards'
                                          }}
                                          onClick={() => {
                                            // Set animating state to start the disappear animation immediately
                                            setAnimatingSuggestion({
                                              analysisIndex: imageIndex,
                                              ideaIndex
                                            })

                                            // After suggestion animation completes (500ms), add text and hide the suggestion
                                            setTimeout(() => {
                                              const currentText = textContent
                                              const newText = currentText
                                                ? `${currentText}\n\n${idea}`
                                                : idea
                                              setTextContent(newText)
                                              // Update textarea value directly
                                              if (textareaRef.current) {
                                                textareaRef.current.value = newText
                                              }
                                              setAnimatingTextarea(true)
                                              setHiddenSuggestions((prev) =>
                                                new Set(prev).add(suggestionKey)
                                              ) // Hide this suggestion permanently
                                              setAnimatingSuggestion(null) // Clear animation state

                                              // Reset textarea animation after it completes (800ms)
                                              setTimeout(() => {
                                                setAnimatingTextarea(false)
                                              }, 800)
                                            }, 1200) // Match suggestion disappear animation duration
                                          }}
                                        >
                                          <div className="flex flex-col items-start justify-center gap-3 text-left">
                                            <p className="text-sm text-gray-800 leading-relaxed line-clamp-4 text-balance">
                                              {typeof idea === 'string'
                                                ? idea
                                                : JSON.stringify(idea)}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    })
                                    .filter(Boolean)
                                : []
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content Type Selector */}
                      <FormatSelection />

                      {aiResponse && (
                      <div className="mt-12 space-y-6">
                        <Accordion
                          title="AI Response"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Bot className="w-4 h-4 text-muted-foreground" />}
                        >
                          <div className="flex items-center gap-1 text-xs text-blue-600 mb-4">
                            <History className="w-3 h-3" />
                            <span>Conversation context preserved</span>
                          </div>

                          {/* Raw AI Response */}
                          <div className="border shadow-sm">
                            <div>
                              <div className="text-base font-semibold">
                                Raw AI Response
                              </div>
                            </div>
                            <div>
                              <div className="space-y-2">
                                <AutoResizeTextarea
                                  value={aiResponse}
                                  readOnly
                                  className="min-h-[200px] whitespace-pre-wrap"
                                />
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {selectedContext === 'Conversations' ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <ConversationMapView map={conversationMapForDisplay} />
                            </div>
                          </div>
                        ) : (
                          editableSteps.length > 0 && (
                            <>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="text-sm font-medium">
                                  Parsed Multi-Step Content
                                </label>
                              </div>
                              <div className="grid gap-6">
                                <StepsList
                                  editableSteps={editableSteps}
                                  editingStepIndices={editingStepIndices}
                                  stepHandlers={stepHandlers}
                                  copiedStepIndex={copiedStepIndex}
                                  deriveHeadingFromContent={deriveHeadingFromContent}
                                  onCopyStep={handleCopyStep}
                                  onStepVisible={loadImagesWhenVisible}
                                />
                              </div>
                            </>
                          )
                        )}
                      </div>
                    )}

                    {/* Generate Designs Button */}
                    {editableSteps.length > 0 && !isProcessing && (
                      <div className="mt-8 pt-6 border-t border-border">
                        <Button
                          size="lg"
                          className="w-full h-16 text-lg font-semibold flex items-center justify-center gap-2"
                          disabled={isGeneratingDesign}
                          onClick={() => {
                            void handleGenerateDesign()
                          }}
                        >
                          {isGeneratingDesign ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Preparing designs...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Designs in Studio
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Context detail options */}

            {selectedContextOptions.length > 0 && (
              <div className={`mb-8 max-w-4xl mx-auto  transition-all duration-500 ease-out ${
                hidingSuggestionsCarousel ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-96'
              }`}>
                <Carousel data-id="SuggestionTilesContainer" className="relative w-full" opts={{ align: 'start' }}>
                  <CarouselContent>
                    {selectedContextOptions.map((option, index) => {
                      const isSelected = selectedContextDetail === option.text

                      return (
                        <CarouselItem
                          key={option.text}
                          className="basis-1/3  md:basis-1/5 lg:basis-1/6 py-2"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            animationFillMode: 'forwards'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContextDetail(option.text)

                              // Append prompt to the top of textarea with empty line
                              const currentValue = textareaRef.current?.value || ''
                              const newText = option.prompt + '\n\n' + currentValue

                              setTextContent(newText)

                              // Update textarea value directly
                              if (textareaRef.current) {
                                textareaRef.current.value = newText
                                // Focus the textarea
                                textareaRef.current.focus()
                                // Position cursor at the end
                                textareaRef.current.setSelectionRange(newText.length, newText.length)
                              }

                              // Trigger textarea animation
                              setAnimatingTextarea(true)
                              setTimeout(() => {
                                setAnimatingTextarea(false)
                              }, 800)

                              // Hide suggestions carousel with animation
                              setHidingSuggestionsCarousel(true)
                            }}
                            className={`group relative flex h-full w-full flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-300 cursor-pointer hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent md:aspect-square ${
                              isSelected
                                ? 'border-primary shadow-lg ring-2 ring-primary/60'
                                : 'border-gray-200 hover:border-white hover:'
                            }`}
                            aria-pressed={isSelected}
                          >
                            <ArrowUp
                              className={`absolute right-4 top-4 h-4 w-4 transition-colors ${
                                isSelected
                                  ? 'text-primary'
                                  : 'text-muted-foreground group-hover:text-primary'
                              }`}
                            />
                            <span className="text-3xl md:text-4xl mb-2" aria-hidden="true">
                              {option.emoji}
                            </span>
                            <span className="mt-auto text-xs md:text-sm font-semibold text-balance leading-snug text-gray-900 line-clamp-4 word-break-all">
                              {option.text}
                            </span>
                          </button>
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="-left-6" />
                  <CarouselNext className="-right-6" />
                </Carousel>
              </div>
            )}

        </main>
      </div>
    </>
  )
}
