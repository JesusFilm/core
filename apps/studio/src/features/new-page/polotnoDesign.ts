import type { GeneratedStepContent } from '../../libs/storage'

type SelectedOutputsMap = Record<string, string[]>

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

const DIMENSION_REGEX = /(\d+)\s*[×xX]\s*(\d+)/

const generateElementId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`

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

export const splitContentIntoSections = (content: string) => {
  return content
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter((section) => section.length > 0)
}

export const extractHeadingAndBody = (section: string) => {
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

export const deriveHeadingFromContent = (content: string, fallback: string) => {
  if (!content) return fallback
  const { heading } = extractHeadingAndBody(content)
  return heading || fallback
}

export const deriveBodyFromContent = (content: string) => {
  if (!content) return ''
  const { body } = extractHeadingAndBody(content)
  return body
}

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

const normalizeStep = (
  step: GeneratedStepContent | null | undefined,
  index: number
) => {
  if (!step) return null

  const fallbackHeading = `Step ${index + 1}`
  const possibleTitle =
    typeof (step as { title?: unknown })?.title === 'string'
      ? ((step as { title?: string }).title ?? '').trim()
      : ''

  let content = typeof step?.content === 'string' ? step.content.trim() : ''

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
    selectedImageUrl: (step as any).selectedImageUrl,
    selectedVideoUrl: (step as any).selectedVideoUrl
  }
}

const buildStructuredPages = (
  steps: Array<ReturnType<typeof normalizeStep>>, 
  width: number,
  height: number
) => {
  return steps.map((step, index) => {
    if (!step) {
      throw new Error('Step normalization produced null entry')
    }

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

    const elements: any[] = []

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
      background: 'linear-gradient(0deg, rgba(31,29,29,1) 0%,rgba(255,0,0,1) 100%)',
      bleed: 0,
      duration: 5000,
      width,
      height
    }
  })
}

const buildFallbackPages = (
  rawContent: string,
  width: number,
  height: number
) => {
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

    const elements = [headingElement]

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
}

export type { SelectedOutputsMap }

export const createPolotnoDesignFromContent = ({
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
    .map((step, index) => normalizeStep(step, index))
    .filter(
      (step): step is ReturnType<typeof normalizeStep> => step !== null
    )

  const hasStructuredSteps = normalizedSteps.length > 0

  const pages = hasStructuredSteps
    ? buildStructuredPages(normalizedSteps, width, height)
    : buildFallbackPages(rawContent, width, height)

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
        ? normalizedSteps.map((step) => step?.heading ?? '')
        : []
    }
  }
}
