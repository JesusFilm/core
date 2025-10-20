import {
  ArrowUp,
  Bot,
  Camera,
  Check,
  Copy,
  Crown,
  Facebook,
  FileText,
  Globe,
  HelpCircle,
  History,
  Image as ImageIcon,
  Info,
  Instagram,
  Layers,
  Loader2,
  MessageCircle,
  MessageSquare,
  Palette,
  Plus,
  Printer,
  Search,
  Settings,
  Trash2,
  Sparkles,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'

import { Accordion } from '../src/components/ui/accordion'
import { Button } from '../src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../src/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../src/components/ui/carousel'
import { Checkbox } from '../src/components/ui/checkbox'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../src/components/ui/tabs'
import { Textarea } from '../src/components/ui/textarea'
import {
  type GeneratedStepContent,
  type UserInputData,
  userInputStorage
} from '../src/libs/storage'

// Dynamic imports for components to avoid hydration issues
const AnimatedLoadingText = dynamic(
  () => Promise.resolve(() => (
    <span className="inline-flex items-center">
      <span className="animate-pulse">R</span>
      <span className="animate-pulse" style={{ animationDelay: '0.1s' }}>u</span>
      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>n</span>
      <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>n</span>
      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>i</span>
      <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>n</span>
      <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>g</span>
      <span className="animate-pulse" style={{ animationDelay: '0.7s' }}>.</span>
      <span className="animate-pulse" style={{ animationDelay: '0.8s' }}>.</span>
      <span className="animate-pulse" style={{ animationDelay: '0.9s' }}>.</span>
    </span>
  )),
  { ssr: false }
)

// Client-only format selection component
const FormatSelection = dynamic(
  () => Promise.resolve(() => {
    const [selectedFormat, setSelectedFormat] = useState<string>('')

    const handleFormatChange = (format: string) => {
      setSelectedFormat(format)
    }

    return (
      <div className="mt-12 hidden">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-lg font-semibold">
            In what format?
          </label>
          <span className="text-sm text-muted-foreground">
            Expected output format from this task
          </span>
        </div>
        <div className="grid grid-cols-5 gap-4 mb-8">
          {/* Images */}
          <div
            className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
              selectedFormat === 'Images'
                ? 'bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 border-purple-500'
                : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-600 hover:to-red-600'
            }`}
            onClick={() => handleFormatChange('Images')}
          >
            <div className="p-3">
              <ImageIcon
                className={`w-8 h-8 ${selectedFormat === 'Images' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
              />
            </div>
            <span
              className={`font-medium text-sm text-center ${selectedFormat === 'Images' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            >
              Images
            </span>
          </div>

          {/* Videos */}
          <div
            className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
              selectedFormat === 'Videos'
                ? 'bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 border-blue-500'
                : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-blue-500 hover:via-cyan-600 hover:to-teal-600'
            }`}
            onClick={() => handleFormatChange('Videos')}
          >
            <div className="p-3">
              <Video
                className={`w-8 h-8 ${selectedFormat === 'Videos' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
              />
            </div>
            <span
              className={`font-medium text-sm text-center ${selectedFormat === 'Videos' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            >
              Videos
            </span>
          </div>

          {/* Text */}
          <div
            className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
              selectedFormat === 'Text'
                ? 'bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600 border-emerald-500'
                : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-emerald-500 hover:via-green-600 hover:to-lime-600'
            }`}
            onClick={() => handleFormatChange('Text')}
          >
            <div className="p-3">
              <MessageCircle
                className={`w-8 h-8 ${selectedFormat === 'Text' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
              />
            </div>
            <span
              className={`font-medium text-sm text-center ${selectedFormat === 'Text' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            >
              Text
            </span>
          </div>

          {/* Web */}
          <div
            className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
              selectedFormat === 'Web'
                ? 'bg-gradient-to-br from-orange-500 via-yellow-600 to-amber-600 border-orange-500'
                : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-orange-500 hover:via-yellow-600 hover:to-amber-600'
            }`}
            onClick={() => handleFormatChange('Web')}
          >
            <div className="p-3">
              <Globe
                className={`w-8 h-8 ${selectedFormat === 'Web' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
              />
            </div>
            <span
              className={`font-medium text-sm text-center ${selectedFormat === 'Web' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            >
              Web
            </span>
          </div>

          {/* Print */}
          <div
            className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
              selectedFormat === 'Print'
                ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 border-rose-500'
                : 'bg-transparent border-gray-300 hover:bg-gradient-to-br hover:from-rose-500 hover:via-pink-600 hover:to-fuchsia-600'
            }`}
            onClick={() => handleFormatChange('Print')}
          >
            <div className="p-3">
              <Printer
                className={`w-8 h-8 ${selectedFormat === 'Print' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
              />
            </div>
            <span
              className={`font-medium text-sm text-center ${selectedFormat === 'Print' ? 'text-white drop-shadow-lg' : 'text-black group-hover:text-white group-hover:drop-shadow-lg'}`}
            >
              Print
            </span>
          </div>
        </div>
      </div>
    )
  }),
  { ssr: false }
)

const steps = [
  { id: 1, title: 'Content', description: 'What do you want to share?' },
  { id: 2, title: 'Style', description: 'Choose your design style' },
  { id: 3, title: 'Output', description: 'Select output formats' }
]

const BASE_SYSTEM_PROMPT = `You are a content creation assistant for Jesus Film Project. Based on the user's devotional content, create an engaging and shareable version that:

1. Maintains the core spiritual message
2. Makes it suitable for social media sharing
3. Encourages reflection and engagement
4. Keeps it concise and impactful
5. Uses warm, inviting language`

const REFINEMENT_INSTRUCTIONS = `When refining or improving content, consider:
- Previous AI responses may show patterns in content style and messaging
- Maintain consistency with your previous suggestions
- Build upon rather than contradict earlier improvements
- If no previous context is available, proceed with standard enhancement`

const OUTPUT_FORMAT_INSTRUCTIONS = `Provide the response as JSON with this structure:
{
  "steps": [
    {
      "content": "# Short label for the step (max 6 words)\\n\\nMarkdown-formatted instagram sotry or messages copy for this step",
      "keywords": "singleword-keyword, singleword-keyword, singleword-keyword",
      "mediaPrompt": "≤150 character prompt for an image/video generator"
    }
  ]
}`

const RESPONSE_GUIDELINES = `Guidelines:
- Include 7-12 sequential steps tailored to the user's request.
- Keep the core spiritual message while making each step social-ready.
- Provide three exactly single-word keywords per step that is suitable for Unsplash image searches.
- The mediaPrompt should align with the step's tone and visuals.
- Use markdown formatting inside the content field when helpful.
- Begin each content field with a level-one markdown heading that states the step's short label (e.g., "# Let Your Light Shine") followed by a blank line.`

const contextSystemPrompts: Record<string, string> = {
  default:
    'Default to producing ministry-ready resources that can flex between digital and in-person sharing when no specific context is selected. Provide balanced guidance that keeps the content adaptable.',
  'Conversations':
    'Guide one-on-one or small group conversations that gently introduce gospel truths. Provide step-by-step talk tracks, reflective questions, prayer suggestions, and gracious transitions. Emphasize empathy, listening, and Scripture references when natural. Align media prompts with visuals that feel personal, calm, and suitable for private messaging.',
  'Social Media':
    'Operate like a Canva-style designer for social media campaigns. Treat each step as a templated design idea for stories, carousels, reels, or feed posts. Suggest layout direction, color palettes, typography moods, and short, scroll-stopping copy. Keep platform conventions (vertical ratios, accessibility, alt-text) in mind and tailor media prompts to energetic, template-friendly visuals.',
  Website:
    'Act as a simple website builder focused on ministry landing pages. Outline hero messaging, section structure, calls to action, and follow-up pathways that help visitors take the next spiritual step. Provide guidance on responsive layout, navigation clarity, and content hierarchy. Recommend imagery that builds trust and a welcoming digital doorway, and craft media prompts for cohesive hero or section artwork.',
  Print:
    'Serve as a Canva-style designer producing print-ready assets that will be downloaded as PDFs. Include details about page sizes, margin or bleed considerations when helpful, and ensure copy remains legible in physical formats. Suggest tangible distribution ideas such as flyers, postcards, or posters. Shape media prompts around high-resolution artwork that reproduces cleanly when printed.',
  'Real Life':
    'Support real-world ministry efforts beyond digital channels. Offer actionable steps for events, discipleship moments, pastoral care, missions, or community service. Provide talking points, activity ideas, and tangible follow-up resources that equip Christians, missionaries, and pastors. Encourage cultural sensitivity and spiritual discernment, and use media prompts to inspire helpful reference visuals, handouts, or props.'
}

const contextDetailOptions: Record<string, Array<{ text: string; emoji: string; prompt: string }>> = {
  'Conversations': [
    { text: 'Start a conversation', prompt: 'Start a friendly chat with someone I haven\'t talked to in a while, without sounding forced.', emoji: '💬' },
    { text: 'Reconnect', prompt: 'Reach out to someone I\'ve lost touch with and express genuine interest in their life.', emoji: '🙋‍♂️' },
    { text: 'Invite to talk more', prompt: 'Invite someone to continue our conversation and deepen our connection.', emoji: '💭' },
    { text: "Say you're sorry", prompt: 'Apologize sincerely for something I\'ve done wrong and seek reconciliation.', emoji: '🙇' },
    { text: 'Encourage a friend', prompt: 'Offer words of encouragement and support to someone going through a difficult time.', emoji: '🙌' },
    { text: 'Share your story', prompt: 'Share a personal testimony or experience that could inspire or help others.', emoji: '📝' },
    { text: 'Share a verse', prompt: 'Share a meaningful Bible verse that relates to the current situation.', emoji: '📖' },
    { text: 'Offer a prayer', prompt: 'Offer to pray for someone or share a prayer that addresses their needs.', emoji: '🤲' }
  ],
  'Social Media': [
    { text: 'Create a social post design', prompt: 'Design an engaging social media post that captures attention and communicates a clear message.', emoji: '🖼️' },
    { text: 'Design a carousel series', prompt: 'Create a multi-slide carousel that tells a story or presents information progressively.', emoji: '🧩' },
    { text: 'Plan a short-form video', prompt: 'Plan a brief, impactful video content for platforms like Instagram Reels or TikTok.', emoji: '🎬' },
    { text: 'Write captions for reels & stories', prompt: 'Write compelling captions that complement short-form video content.', emoji: '✍️' },
    { text: 'Map a community engagement idea', prompt: 'Develop an idea for engaging with the community through social media initiatives.', emoji: '📣' }
  ],
  Website: [
    { text: 'Create an embeddable carousel', prompt: 'Design a carousel component that can be easily embedded in websites.', emoji: '🧷' },
    { text: 'Build a simple landing page', prompt: 'Create an effective landing page that converts visitors into engaged users.', emoji: '🖥️' },
    { text: 'Lay out a page with sections', prompt: 'Structure a webpage with clear, organized sections for optimal user experience.', emoji: '📐' },
    { text: 'Draft copy for featured designs', prompt: 'Write persuasive copy highlighting key design elements and benefits.', emoji: '📝' }
  ],
  Print: [
    { text: 'Design church invite cards', prompt: 'Create attractive invitation cards for church events with clear details and compelling visuals.', emoji: '⛪' },
    { text: 'Create outreach flyers', prompt: 'Design informative flyers to promote church programs and community outreach.', emoji: '📣' },
    { text: 'Make shareable cards', prompt: 'Create cards with inspirational messages or Bible verses that people can easily share.', emoji: '💌' },
    { text: 'Generate QR code posters', prompt: 'Design posters featuring QR codes that link to online resources or event registration.', emoji: '🔗' },
    { text: 'Print sticker sheets', prompt: 'Create sheets of stickers with church branding, Bible verses, or motivational messages.', emoji: '🏷️' }
  ],
  'Real Life': [
    { text: 'Write discussion questions', prompt: 'Create thoughtful questions to facilitate meaningful group discussions about faith topics.', emoji: '❓' },
    { text: 'Plan life application ideas', prompt: 'Develop practical ways to apply biblical principles to everyday life situations.', emoji: '🧭' },
    { text: 'Outline a short sermon', prompt: 'Structure a brief, focused message with clear main points and practical applications.', emoji: '🎙️' },
    { text: 'Prepare a group lesson', prompt: 'Create an engaging lesson plan for small group Bible study or discipleship.', emoji: '👥' },
    { text: 'Create a family devotion', prompt: 'Design a family-focused spiritual activity with Bible reading and discussion.', emoji: '🏠' }
  ]
}

// Removed - now using proper conversation history instead of RAG

const IMAGE_ANALYSIS_PROMPT = `You are an expert at analyzing content images from religious and spiritual point of view for our digital ai tool that helps the user create content for social media and private gospel sharing using images, text or video. Your task is to generate gospel-focused content ideas that help private conversations or social media followers consider God, Gospel, and Salvation. Each idea should be a practical, actionable suggestion based on the image content.  Gospel-centered content ideas inspired by this image. Each idea should connect naturally to the visual, point people toward God, the Gospel, and Salvation, and be practical for sharing in private conversations or on social media. Keep ideas specific, actionable, and matched to what our Canva-like design tool can create (e.g., Instagram stories, carousels, social posts, simple videos, or printable PDFs).
  content ideas inspired by this image. Each idea should connect 
  naturally to the visual, point people toward God, the Gospel, and 
  Salvation, and be practical for sharing in private conversations or 
  on social media. Keep ideas specific, actionable, and matched to 
  what our Canva-like design tool can create (e.g., Instagram 
  stories, carousels, social posts, simple videos, or printable PDFs).

Analyze this image and provide a detailed response in the following JSON format:

{
  "contentType": "One of: devotional, bible, church_service_slide, sermon_notes, scripture_verse, worship_image, religious_artwork, nature_spiritual, community_event, ministry_activity, personal_message, comment, email, news_article, other",
  "extractedText": "Any text visible in the image - perform OCR and extract all readable text exactly as it appears",
  "detailedDescription": "If there's no text, provide a detailed description of the image including: composition, colors, mood, setting, any people/objects/symbols, artistic style, and spiritual/religious elements",
  "confidence": "Overall confidence in the analysis (high/medium/low)",
  "contentIdeas": ["First gospel-focused content idea as a string inspired by the image and most appropriate for the image content (10 words max)", "Second gospel-focused content idea as a string inspired by the image and most appropriate for the image content (10 words max)", "Third gospel-focused content idea as a string inspired by the image and most appropriate for the image content (10 words max)"]
}

Content type definitions:
- devotional: Images designed for daily devotionals, quiet time, spiritual reflection
- bible: Illustrations or photos depicting bible stories, characters, or scenes
- church_service_slide: PowerPoint slides or presentation slides used in church services
- sermon_notes: Notes or outlines from sermons, preaching materials, study guides
- scripture_verse: Images containing bible verses, often with decorative backgrounds
- worship_image: Images related to worship, praise, music ministry
- religious_artwork: Paintings, drawings, or artistic representations with religious themes
- nature_spiritual: Nature scenes used for spiritual purposes or contemplation
- community_event: Photos of church events, gatherings, fellowship activities
- ministry_activity: Images showing ministry work, outreach, service projects
- personal_message: Screenshot of a private conversation that users needs help with to lean it to gospel and bible truth
- comment: Comments on social media, discussions, or feedback
- email: Email communications, newsletters, or correspondence
- news_article: Some intereste based on current events artivle that user uploads as context for his outreach effort
- other: Any other type of religious/spiritual content not covered above

Be thorough and accurate in your analysis.`

// Category-specific sharing options
const categorySharingOptions = {
  'Conversations': [
    'in a text with your friends',
    'in a group chat with your family',
    'in a prayer group on WhatsApp',
    'in YouTube comments',
    'in a private message to someone in need'
  ],
  'Social Media': [
    'on your Instagram stories',
    "in your church's Facebook group",
    'in your Twitter/X post',
    'on your TikTok feed',
    'with your colleagues on LinkedIn'
  ],
  Website: [
    "on your church's website",
    'in your ministry blog post',
    'in your online testimony page',
    'in your podcast website',
    'on your nonprofit homepage'
  ],
  Print: [
    'in a printed church bulletin',
    'on a flyer for your community event',
    'in your devotional journal',
    'on a Bible study handout',
    'in your published book/article'
  ],
  'Real Life': [
    'in a sermon at your church',
    'in a small group Bible study',
    'in a conversation with a neighbor',
    'during a conference or retreat',
    'at a youth group meeting'
  ]
}

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
        selectedImageUrl: (step as any).selectedImageUrl,
        selectedVideoUrl: (step as any).selectedVideoUrl
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

const RotatingText = React.memo(({
  onCategoryChange,
  hoveredCategory,
  isHovering,
  isAnimationStopped
}: {
  onCategoryChange: (category: string) => void
  hoveredCategory: string | null
  isHovering: boolean
  isAnimationStopped: boolean
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  // All rotating items for auto-rotation when not hovering
  const rotatingItems = [
    // Conversations - Blue gradient
    {
      text: 'in a text with your friends',
      category: 'Conversations',
      colorClass: 'text-cyan-600'
    },
    {
      text: 'on your Instagram stories',
      category: 'Social Media',
      colorClass: 'text-pink-500'
    },
    {
      text: "on your church's website",
      category: 'Website',
      colorClass: 'text-orange-500'
    },
    {
      text: 'in a printed church bulletin',
      category: 'Print',
      colorClass: 'text-emerald-600'
    },
    {
      text: 'in a sermon at your church',
      category: 'Real Life',
      colorClass: 'text-rose-500'
    },

    // Social Media - Purple/Pink/Red gradient
    {
      text: 'in a group chat with your family',
      category: 'Conversations',
      colorClass: 'text-cyan-600'
    },
    {
      text: "in your church's Facebook group",
      category: 'Social Media',
      colorClass: 'text-pink-500'
    },
    {
      text: 'in your ministry blog post',
      category: 'Website',
      colorClass: 'text-orange-500'
    },
    {
      text: 'on a flyer for your community event',
      category: 'Print',
      colorClass: 'text-emerald-600'
    },
    {
      text: 'in a small group Bible study',
      category: 'Real Life',
      colorClass: 'text-rose-500'
    },

    // Website - Orange/Yellow/Amber gradient
    {
      text: 'in a prayer group on WhatsApp',
      category: 'Conversations',
      colorClass: 'text-cyan-600'
    },
    {
      text: 'in your Twitter/X post',
      category: 'Social Media',
      colorClass: 'text-pink-500'
    },
    {
      text: 'in your online testimony page',
      category: 'Website',
      colorClass: 'text-orange-500'
    },
    {
      text: 'in your devotional journal',
      category: 'Print',
      colorClass: 'text-emerald-600'
    },
    {
      text: 'in a conversation with a neighbor',
      category: 'Real Life',
      colorClass: 'text-rose-500'
    },

    // Print - Emerald/Green/Lime gradient
    {
      text: 'in YouTube comments',
      category: 'Conversations',
      colorClass: 'text-cyan-600'
    },
    {
      text: 'on your TikTok feed',
      category: 'Social Media',
      colorClass: 'text-pink-500'
    },
    {
      text: 'in your podcast website',
      category: 'Website',
      colorClass: 'text-orange-500'
    },
    {
      text: 'on a Bible study handout',
      category: 'Print',
      colorClass: 'text-emerald-600'
    },
    {
      text: 'during a conference or retreat',
      category: 'Real Life',
      colorClass: 'text-rose-500'
    },

    // Real Life - Rose/Pink/Fuchsia gradient
    {
      text: 'in a private message to someone in need',
      category: 'Conversations',
      colorClass: 'text-cyan-600'
    },
    {
      text: 'with your colleagues on LinkedIn',
      category: 'Social Media',
      colorClass: 'text-pink-500'
    },
    {
      text: 'on your nonprofit homepage',
      category: 'Website',
      colorClass: 'text-orange-500'
    },
    {
      text: 'in your published book/article',
      category: 'Print',
      colorClass: 'text-emerald-600'
    },
    {
      text: 'at a youth group meeting',
      category: 'Real Life',
      colorClass: 'text-rose-500'
    }
  ]

  // Auto-rotate when not hovering
  useEffect(() => {
    if (!isHovering && !isAnimationStopped) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingItems.length)
      }, 3000) // Change every 3 seconds

      return () => clearInterval(interval)
    }
  }, [rotatingItems.length, isHovering, isAnimationStopped])

  // Update category when not hovering
  useEffect(() => {
    if (!isHovering && !isAnimationStopped) {
      onCategoryChange(rotatingItems[currentIndex].category)
    }
  }, [currentIndex, onCategoryChange, rotatingItems, isHovering, isAnimationStopped])

  // Handle hover state - show category-specific options
  useEffect(() => {
    if (isHovering && hoveredCategory) {
      // Cycle through options for the hovered category
      const categoryOptions = categorySharingOptions[hoveredCategory] || []
      if (categoryOptions.length > 0) {
        const interval = setInterval(() => {
          setCurrentTextIndex(
            (prevIndex) => (prevIndex + 1) % categoryOptions.length
          )
        }, 2000) // Change every 2 seconds for hover state

        return () => clearInterval(interval)
      }
    }
  }, [isHovering, hoveredCategory])

  // Get the current text to display
  const getCurrentText = () => {
    if (isHovering && hoveredCategory) {
      const categoryOptions = categorySharingOptions[hoveredCategory] || []
      return (
        categoryOptions[currentTextIndex] ||
        `with ${hoveredCategory.toLowerCase()}`
      )
    }
    return rotatingItems[currentIndex]?.text || ''
  }

  // Get the current color class
  const getCurrentColorClass = () => {
    if (isHovering && hoveredCategory) {
      const categoryColors = {
        'Conversations': 'text-cyan-600',
        'Social Media': 'text-pink-500',
        Website: 'text-orange-500',
        Print: 'text-emerald-600',
        'Real Life': 'text-rose-500'
      }
      return categoryColors[hoveredCategory] || 'text-cyan-600'
    }
    return rotatingItems[currentIndex]?.colorClass || 'text-cyan-600'
  }

  return (
    <span
      className={`inline-block animate-text-rotate font-semibold ${getCurrentColorClass()}`}
      data-highlight-category={
        isHovering && hoveredCategory
          ? hoveredCategory
          : rotatingItems[currentIndex]?.category
      }
    >
      {getCurrentText()}
    </span>
  )
})

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
  const [selectedOutputs, setSelectedOutputs] = useState<SelectedOutputsMap>({})
  const [isTilesContainerHovered, setIsTilesContainerHovered] = useState<boolean>(false)

  const selectedContextOptions =
    contextDetailOptions[selectedContext] ?? []

  const selectedDetailOption = useMemo(() => {
    if (!selectedContextDetail) {
      return null
    }

    const options = contextDetailOptions[selectedContext] ?? []
    return (
      options.find((option) => option.text === selectedContextDetail) ?? null
    )
  }, [selectedContext, selectedContextDetail])

  const parsedContentHeadingSuffix = useMemo(() => {
    if (!selectedContext || !selectedContextDetail) {
      return ''
    }

    // Remove "Plan " prefix and add "a " prefix for the detail
    const modifiedDetail = selectedContextDetail.startsWith('Plan ')
      ? ' a ' + selectedContextDetail.slice(5).toLowerCase()
      : selectedContextDetail.charAt(0).toLowerCase() + selectedContextDetail.slice(1)

    return `${modifiedDetail} for ${selectedContext.toLowerCase()}`
  }, [selectedContext, selectedContextDetail])

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [unsplashApiKey, setUnsplashApiKey] = useState('')
  const [textContent, setTextContent] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [editableSteps, setEditableSteps] = useState<GeneratedStepContent[]>([])
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null)
  const [editingStepIndices, setEditingStepIndices] = useState<Set<number>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageAttachments, setImageAttachments] = useState<string[]>([])
  const [unsplashImages, setUnsplashImages] = useState<Record<string, string[]>>({})
  const [loadingUnsplashSteps, setLoadingUnsplashSteps] = useState<Set<string>>(new Set())
  const [loadingSession, setLoadingSession] = useState<string | null>(null)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [imageAnalysisResults, setImageAnalysisResults] = useState<
    Array<{
      imageSrc: string
      contentType: string
      extractedText: string
      detailedDescription: string
      confidence: string
      contentIdeas: string[]
      isAnalyzing: boolean
    }>
  >([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false)
  const [personaSettings, setPersonaSettings] = useState({
    personaName: '',
    audienceDescription: '',
    tone: '',
    goals: ''
  })
  const [savedSessions, setSavedSessions] = useState<UserInputData[]>([])
  const [totalTokensUsed, setTotalTokensUsed] = useState({
    input: 0,
    output: 0
  })
  const [isTokensUpdated, setIsTokensUpdated] = useState(false)
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(
    new Set()
  )
  const [showTestimonialBackground, setShowTestimonialBackground] =
    useState(true)
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
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

  // Create stable handlers for step interactions to prevent re-renders
  const stepHandlers = useMemo(() => {
    const handlers: Record<number, {
      onContentChange: (value: string) => void
      onFocus: () => void
    }> = {}

    editableSteps.forEach((_, index) => {
      handlers[index] = {
        onContentChange: (value: string) => handleStepContentChange(index, value),
        onFocus: () => {
          setEditingStepIndices(prev => new Set([...prev, index]))
        }
      }
    })

    return handlers
  }, [editableSteps.length]) // Only recreate when step count changes

  // Load saved data on mount
  useEffect(() => {
    const allSessions = userInputStorage.getAllSessions()
    setSavedSessions(allSessions)
  }, [])

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

  // Intersection Observer hook for lazy loading
  const useIntersectionObserver = (callback: () => void, options?: IntersectionObserverInit) => {
    const [element, setElement] = useState<Element | null>(null)
    const [hasTriggered, setHasTriggered] = useState(false)

    useEffect(() => {
      if (!element || hasTriggered) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            callback()
            setHasTriggered(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1, ...options }
      )

      observer.observe(element)

      return () => observer.disconnect()
    }, [element, callback, hasTriggered, options])

    return { ref: setElement }
  }

  // Intersection Observer for lazy loading Unsplash images
  const loadImagesWhenVisible = (step: GeneratedStepContent, stepIndex: number) => {
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

  const handleOutputChange = (
    category: string,
    optionName: string,
    checked: boolean
  ) => {
    setSelectedOutputs((prev) => {
      const categoryOutputs = prev[category] || []
      if (checked) {
        return { ...prev, [category]: [...categoryOutputs, optionName] }
      } else {
        return {
          ...prev,
          [category]: categoryOutputs.filter((o) => o !== optionName)
        }
      }
    })
  }

  const handleContextChange = useCallback((context: string) => {
    setSelectedContext(context)
    setSelectedContextDetail('')
    setIsContextContainerHidden(true)
    setHighlightedCategory('') // Stop automatic highlight animation when a tile is selected
    setIsAnimationStopped(true) // Stop the rotating text animation
    setHidingSuggestionsCarousel(false) // Show suggestions carousel when switching contexts
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

    let systemPrompt = [
      BASE_SYSTEM_PROMPT,
      REFINEMENT_INSTRUCTIONS,
      `Context focus:\n${contextPrompt}`,
      OUTPUT_FORMAT_INSTRUCTIONS,
      RESPONSE_GUIDELINES
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

  const parseGeneratedSteps = (rawContent: string): GeneratedStepContent[] => {
    if (!rawContent) return []

    let preparedContent = rawContent.trim()
    const codeBlockMatch = preparedContent.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (codeBlockMatch?.[1]) {
      preparedContent = codeBlockMatch[1].trim()
    }

    try {
      const parsed = JSON.parse(preparedContent)
      const stepsArray = Array.isArray(parsed?.steps)
        ? parsed.steps
        : Array.isArray(parsed)
          ? parsed
          : []

      if (Array.isArray(stepsArray) && stepsArray.length > 0) {
        return normalizeGeneratedSteps(stepsArray as GeneratedStepContent[])
      }
    } catch (error) {
      console.warn(
        'Failed to parse structured multi-step content. Falling back to default format.',
        error
      )
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
      return normalizeGeneratedSteps(fallbackSteps)
    }

    return normalizeGeneratedSteps([
      {
        content: rawContent.trim(),
        keywords: [],
        mediaPrompt: ''
      }
    ])
  }

  const handleStepContentChange = useCallback((index: number, value: string) => {
    setEditableSteps((prev) => {
      if (!prev[index]) return prev
      const updated = [...prev]
      updated[index] = { ...updated[index], content: value }
      return updated
    })
  }, [])

  const handleImageSelection = useCallback((stepIndex: number, imageUrl: string) => {
    setEditableSteps((prev) => {
      if (!prev[stepIndex]) return prev
      const updated = [...prev]
      updated[stepIndex] = { ...updated[stepIndex], selectedImageUrl: imageUrl }
      return updated
    })
  }, [])

  // Memoized component for steps to prevent re-renders from tile hover states
  const StepsList = React.memo(({
    editableSteps,
    editingStepIndices,
    stepHandlers,
    copiedStepIndex,
    unsplashImages,
    onImageSelection
  }: {
    editableSteps: GeneratedStepContent[]
    editingStepIndices: Set<number>
    stepHandlers: Record<number, { onContentChange: (value: string) => void; onFocus: () => void }>
    copiedStepIndex: number | null
    unsplashImages: Record<string, string[]>
    onImageSelection: (stepIndex: number, imageUrl: string) => void
  }) => {
    return (
      <>
        {editableSteps.map((step, index) => {
          const heading = deriveHeadingFromContent(
            step.content,
            `Step ${index + 1}`
          )
          const cardKey = heading
            ? `${heading}-${index}`
            : `step-${index}`

          // Intersection observer for lazy loading images
          const { ref: cardRef } = useIntersectionObserver(
            () => loadImagesWhenVisible(step, index),
            { threshold: 0.1 }
          )

          return (
            <div key={cardKey} ref={cardRef}>
              <Card className="bg-transparent shadow-none">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <StepContentRenderer
                    content={step.content}
                    className="-mx-6"
                    stepIndex={index}
                    isEditing={editingStepIndices.has(index)}
                    onContentChange={stepHandlers[index]?.onContentChange}
                    onFocus={stepHandlers[index]?.onFocus}
                    copiedStepIndex={copiedStepIndex}
                  />
                </div>
                <div className="space-y-2 hidden">
                  <h4 className="text-sm font-medium">Media Prompt</h4>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {step.mediaPrompt || 'No prompt provided.'}
                  </p>
                </div>
              </CardContent>
              </Card>
            </div>
          )
        })}
      </>
    )
  })

  const handleCopyStep = async (
    step: GeneratedStepContent,
    index: number
  ): Promise<void> => {
    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard) {
        await navigator.clipboard.writeText(step.content)
        setCopiedStepIndex(index)
      } else {
        throw new Error('Clipboard API unavailable')
      }
    } catch (error) {
      console.error('Failed to copy step content:', error)
      console.warn('Unable to copy content automatically. Please copy manually.')
    }
  }

  const extractTextFromResponse = (result: any): string => {
    if (!result) {
      return ''
    }

    if (typeof result.output_text === 'string' && result.output_text.trim().length > 0) {
      return result.output_text
    }

    if (Array.isArray(result.output)) {
      for (const item of result.output) {
        const content = item?.content
        if (Array.isArray(content)) {
          const textPart = content.find(
            (part: any) => part?.type === 'output_text' && typeof part?.text === 'string'
          )
          if (textPart?.text?.trim()) {
            return textPart.text
          }
        }
      }
    }

    return ''
  }

  const accumulateUsage = (usage: any) => {
    if (!usage) return

    const newTokens = {
      input: usage.input_tokens ?? 0,
      output: usage.output_tokens ?? 0
    }

    setTotalTokensUsed((prev) => ({
      input: prev.input + newTokens.input,
      output: prev.output + newTokens.output
    }))

    // Update current session with new token usage
    if (currentSessionId) {
      const currentSession = userInputStorage.getAllSessions().find(session => session.id === currentSessionId)
      if (currentSession) {
        const existingTokens = currentSession.tokensUsed || { input: 0, output: 0 }
        userInputStorage.updateSession(currentSessionId, {
          tokensUsed: {
            input: existingTokens.input + newTokens.input,
            output: existingTokens.output + newTokens.output
          }
        })
        // Update the saved sessions list to reflect the changes
        setSavedSessions(userInputStorage.getAllSessions())
      }
    }
  }

  const processContentWithAI = async (inputText?: string) => {
    const currentValue = inputText || textareaRef.current?.value || ''
    if (!currentValue.trim()) {
      console.warn('Please enter some content to process.')
      return
    }

    setIsProcessing(true)
    const previousResponse = aiResponse
    const previousSteps = editableSteps
    setAiResponse('')

    try {
      // Build conversation history for proper chat context
      const messages = buildConversationHistory()

      // Add the current user input (or refinement request)
      const currentUserMessage = currentValue.trim()
      messages.push({
        role: 'user',
        content: currentUserMessage
      })

      const response = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          messages
          // max_output_tokens: 2000,
          // temperature: 0.9,
        })
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(errorMessage || 'Failed to process content')
      }

      const data = await response.json()
      const processedContent =
        extractTextFromResponse(data) || 'No response generated'
      setAiResponse(processedContent)
      const parsedSteps = parseGeneratedSteps(processedContent)
      setEditableSteps(parsedSteps)

      // Track token usage first
      const tokenUsage = data.usage ? {
        input: data.usage.input_tokens ?? 0,
        output: data.usage.output_tokens ?? 0
      } : { input: 0, output: 0 }

      // Update total tokens
      setTotalTokensUsed((prev) => ({
        input: prev.input + tokenUsage.input,
        output: prev.output + tokenUsage.output
      }))

      // Save session after AI response is processed with correct token usage
      const sessionId = userInputStorage.saveCurrentSession({
        textContent: currentValue,
        images: imageAttachments,
        aiResponse: processedContent,
        aiSteps: parsedSteps,
        imageAnalysisResults: imageAnalysisResults.map((result) => ({
          imageSrc: result.imageSrc,
          contentType: result.contentType,
          extractedText: result.extractedText,
          detailedDescription: result.detailedDescription,
          confidence: result.confidence,
          contentIdeas: result.contentIdeas
        })),
        tokensUsed: tokenUsage
      })
      // Set this as the current session for future token tracking
      setCurrentSessionId(sessionId)
      setSavedSessions(userInputStorage.getAllSessions())
    } catch (error) {
      console.error('Error processing content:', error)
      // Restore previous response if API call failed
      setAiResponse(previousResponse)
      setEditableSteps(previousSteps)
      console.error('Failed to process content via the AI proxy. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeImageWithAI = async (imageSrc: string, imageIndex: number) => {
    // Mark as analyzing
    setImageAnalysisResults((prev) => {
      const updated = [...prev]
      if (!updated[imageIndex]) {
        updated[imageIndex] = {
          imageSrc,
          contentType: '',
          extractedText: '',
          detailedDescription: '',
          confidence: '',
          contentIdeas: [],
          isAnalyzing: true
        }
      } else {
        updated[imageIndex].isAnalyzing = true
      }
      return updated
    })

    try {
      const response = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using gpt-4o-mini for vision capabilities
          messages: [
            { role: 'system', content: IMAGE_ANALYSIS_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this image:' },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageSrc,
                    detail: 'high' // High detail for better OCR and analysis
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1 // Low temperature for more consistent analysis
        })
      })

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(errorMessage || 'Failed to analyze image')
      }

      const data = await response.json()
      let analysisText = extractTextFromResponse(data) || '{}'

      // Track token usage
      accumulateUsage(data.usage)

      // Extract JSON from markdown code block if present
      if (analysisText.includes('```json') || analysisText.includes('```')) {
        const jsonMatch = analysisText.match(
          /```\s*(?:json)?\s*([\s\S]*?)\s*```/
        )
        if (jsonMatch && jsonMatch[1]) {
          analysisText = jsonMatch[1].trim()
        }
      }

      // Parse the JSON response
      let analysisResult
      try {
        analysisResult = JSON.parse(analysisText)
        // Ensure contentIdeas is always an array
        if (!Array.isArray(analysisResult.contentIdeas)) {
          analysisResult.contentIdeas = []
        }
      } catch (parseError) {
        console.error('Failed to parse analysis response:', parseError)
        console.error('Raw response:', analysisText)
        analysisResult = {
          contentType: 'other',
          extractedText: '',
          detailedDescription: 'Failed to analyze image',
          confidence: 'low',
          contentIdeas: []
        }
      }

      // Update the analysis results
      setImageAnalysisResults((prev) => {
        const updated = [...prev]
        updated[imageIndex] = {
          imageSrc,
          contentType: analysisResult.contentType || 'other',
          extractedText: analysisResult.extractedText || '',
          detailedDescription: analysisResult.detailedDescription || '',
          confidence: analysisResult.confidence || 'low',
          contentIdeas: analysisResult.contentIdeas || [],
          isAnalyzing: false
        }
        return updated
      })
    } catch (error) {
      console.error('Error analyzing image:', error)
      setImageAnalysisResults((prev) => {
        const updated = [...prev]
        updated[imageIndex] = {
          imageSrc,
          contentType: 'error',
          extractedText: '',
          detailedDescription: 'Failed to analyze image. Please try again.',
          confidence: 'low',
          contentIdeas: [],
          isAnalyzing: false
        }
        return updated
      })
    }
  }

  const searchUnsplash = async (query: string, perPage: number = 3): Promise<string[]> => {
    const accessKey = unsplashApiKey || process.env.UNSPLASH_ACCESS_KEY

    console.log('🔑 API Key debug:', {
      unsplashApiKey: unsplashApiKey ? `***${unsplashApiKey.slice(-4)}` : 'not set',
      envVar: process.env.UNSPLASH_ACCESS_KEY ? `***${process.env.UNSPLASH_ACCESS_KEY.slice(-4)}` : 'not set',
      accessKey: accessKey ? `***${accessKey.slice(-4)}` : 'not set',
      query
    })

    if (!accessKey) {
      console.error('❌ UNSPLASH_ACCESS_KEY not found in environment variables or settings')
      return []
    }

    try {
      // Try query parameter approach first to debug
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&content_filter=high&orientation=squarish&client_id=${accessKey}`
      console.log('🌐 Making API request to:', apiUrl.replace(accessKey, `***${accessKey.slice(-4)}`))

      const response = await fetch(apiUrl)

      console.log('📡 Response status:', response.status, response.statusText)

      if (!response.ok) {
        console.error('❌ Unsplash API error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error response body:', errorText)

        // Check for common error patterns
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.errors && errorData.errors.includes('OAuth error: The access token is invalid')) {
            console.error('❌ INVALID API KEY: The Unsplash Access Key you entered is invalid.')
            console.error('💡 SOLUTION: Get a new Access Key from https://unsplash.com/developers')
            console.warn('Please check your Unsplash Access Key in Settings and get a new one from https://unsplash.com/developers if needed.')
          }
        } catch {
          // Error text is not JSON, continue with generic error
        }

        return []
      }

      const data = await response.json()
      console.log(`✅ Unsplash Response for "${query}": ${data.results?.length || 0} images found`)

      if (data.results && data.results.length > 0) {
        console.log('🖼️ First image details:', {
          id: data.results[0].id,
          description: data.results[0].description,
          url: data.results[0].urls?.regular
        })
      }

      const imageUrls = data.results?.map((photo: any) => photo.urls?.regular).filter(Boolean) || []
      console.log(`📸 Extracted ${imageUrls.length} image URLs for "${query}"`)

      return imageUrls
    } catch (error) {
      console.error('💥 Failed to search Unsplash:', error)
      return []
    }
  }

  const loadUnsplashImagesForStep = async (step: GeneratedStepContent, stepIndex: number) => {
    if (!step.keywords.length) return

    const stepKey = `step-${stepIndex}`
    if (unsplashImages[stepKey]) return // Already loaded

    // Set loading state
    setLoadingUnsplashSteps(prev => new Set(prev).add(stepKey))

    const heading = deriveHeadingFromContent(
      step.content,
      `Step ${stepIndex + 1}`
    )

    try {
      let images: string[] = []

      // Try each keyword until we find results
      for (let i = 0; i < step.keywords.length; i++) {
        const keyword = step.keywords[i]
        console.log(
          `🖼️ Loading Unsplash images for Step ${
            stepIndex + 1
          }: "${heading}" using keyword ${i + 1}/${step.keywords.length}: "${keyword}"`
        )

        images = await searchUnsplash(keyword, 12)

        if (images.length > 0) {
          console.log(`✅ Found ${images.length} images for Step ${stepIndex + 1} using keyword: "${keyword}"`)
          break
        } else {
          console.log(`❌ No images found for Step ${stepIndex + 1} using keyword: "${keyword}". Trying next keyword...`)
        }
      }

      console.log(`📸 Completed loading ${images.length} images for Step ${stepIndex + 1}`)

      setUnsplashImages(prev => ({
        ...prev,
        [stepKey]: images
      }))
    } catch (error) {
      console.error('Failed to load Unsplash images for step:', error)
    } finally {
      // Remove loading state
      setLoadingUnsplashSteps(prev => {
        const newSet = new Set(prev)
        newSet.delete(stepKey)
        return newSet
      })
    }
  }

  // Debug function to test Unsplash API
  const testUnsplashAPI = async () => {
    console.log('🧪 Testing Unsplash API...')

    if (!unsplashApiKey && !process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('No Unsplash Access Key found. Please enter one in Settings.')
      setIsSettingsOpen(true)
      return
    }

    const testResult = await searchUnsplash('test', 1)
    console.log('🧪 Test result:', testResult)

    if (testResult.length > 0) {
      console.log(`✅ Unsplash API working! Found ${testResult.length} test image(s).`)
    } else {
      console.warn('❌ Unsplash API test failed. Check your Access Key in Settings.')
    }
  }

  // Expose test function to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testUnsplashAPI = testUnsplashAPI
    }
  }, [])

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
    const currentValue = textareaRef.current?.value || ''
    if (currentValue.trim() && !isProcessing) {
      // Update textContent state before processing
      setTextContent(currentValue)
      await processContentWithAI(currentValue)
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

  const deleteSession = (sessionId: string) => {
    userInputStorage.deleteSession(sessionId)
    setSavedSessions(userInputStorage.getAllSessions())
  }

  const styleOptions = [
    { name: 'Modern', icon: Palette },
    { name: 'Classic', icon: Crown },
    { name: 'Minimal', icon: X },
    { name: 'Bold', icon: Zap },
    { name: 'Elegant', icon: Sparkles }
  ]

  const outputOptions = {
    video: [
      { name: 'Full HD: 1920 × 1080 px', icon: Video },
      { name: '4K UHD: 3840 × 2160 px', icon: Video },
      { name: 'Vertical HD: 1080 × 1920 px', icon: Video },
      { name: 'Square HD: 1080 × 1080 px', icon: Video }
    ],
    social: [
      { name: 'Instagram Post: 1080 × 1080 px', icon: Instagram },
      { name: 'Instagram Story: 1080 × 1920 px', icon: Instagram },
      { name: 'Instagram Ad: 1080 × 1080 px', icon: Instagram },
      { name: 'Facebook Post (Landscape): 1200 × 630 px', icon: Facebook },
      { name: 'Facebook Post (Square): 1080 × 1080 px', icon: Facebook },
      { name: 'Facebook Cover: 851 × 315 px', icon: Facebook },
      { name: 'Twitter Post: 1600 × 900 px', icon: Twitter },
      { name: 'Twitter Header: 1500 × 500 px', icon: Twitter },
      { name: 'Twitter Square: 1080 × 1080 px', icon: Twitter },
      { name: 'LinkedIn Post: 1200 × 627 px', icon: Users },
      { name: 'LinkedIn Banner: 1584 × 396 px', icon: Users },
      { name: 'LinkedIn Square: 1080 × 1080 px', icon: Users },
      { name: 'YouTube Thumbnail: 1280 × 720 px', icon: Youtube },
      { name: 'YouTube Channel: 2560 × 1440 px', icon: Youtube },
      { name: 'YouTube Short: 1080 × 1920 px', icon: Youtube }
    ],
    print: [
      { name: 'Invitation: 14 × 14 cm', icon: FileText },
      { name: 'A4 Portrait: 21 × 29.7 cm', icon: FileText },
      { name: 'A4 Landscape: 29.7 × 21 cm', icon: FileText },
      { name: 'A3: 29.7 × 42 cm', icon: FileText },
      { name: 'Letter Portrait: 8.5 × 11 in', icon: FileText },
      { name: 'Letter Landscape: 11 × 8.5 in', icon: FileText },
      { name: 'Business Card: 3.5 × 2 in', icon: FileText },
      { name: 'Poster: 18 × 24 in', icon: FileText }
    ],
    web: [
      { name: 'Web Page: 1920 × 1080 px', icon: Globe },
      { name: 'Carousel Slide: 1200 × 800 px', icon: Globe },
      { name: 'Embed Banner: 800 × 600 px', icon: Globe },
      { name: 'Hero Section: 1920 × 800 px', icon: Globe },
      { name: 'Card Component: 400 × 300 px', icon: Globe }
    ]
  }

  // MDX renderer component for step content
  const StepContentRenderer = React.memo(({
    content,
    stepIndex,
    isEditing,
    onContentChange,
    onFocus,
    copiedStepIndex,
    className
  }: {
    content: string
    stepIndex: number
    isEditing: boolean
    onContentChange: (value: string) => void
    onFocus: () => void
    copiedStepIndex: number | null
    className?: string
  }) => {
    const [localContent, setLocalContent] = useState(content)

    // Update local content when prop changes (when not editing)
    useEffect(() => {
      if (!isEditing) {
        setLocalContent(content)
      }
    }, [content, isEditing])

    const handleBlur = () => {
      // Only update parent state on blur
      onContentChange(localContent)
      setEditingStepIndices(prev => {
        const newSet = new Set(prev)
        newSet.delete(stepIndex)
        return newSet
      })
    }

    // Focus textarea when entering edit mode (only once per edit session)
    useEffect(() => {
      if (isEditing) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const textarea = document.querySelector(`textarea[data-step-index="${stepIndex}"]`) as HTMLTextAreaElement
          if (textarea) {
            textarea.focus()
          }
        }, 0)
      }
    }, [isEditing, stepIndex])

    return (
      <div className={`relative ${className || ''}`}>
        {isEditing ? (
          <Textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onBlur={handleBlur}
            className="min-h-[160px] whitespace-pre-wrap bg-white border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 text-sm font-mono px-6 py-6 rounded-bl-none rounded-br-none"
            data-step-index={stepIndex}
          />
        ) : (
          (() => {
            try {
              // Simple MDX-like rendering - convert basic markdown to JSX
              const renderMarkdown = (text: string) => {
                // Split by lines and process each line
                const lines = text.split('\n')
                const elements: ReactElement[] = []
                let key = 0

                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i]

                  // Headers
                  if (line.startsWith('# ')) {
                    elements.push(<h1 key={key++} className="text-2xl font-bold mb-2 mt-4 first:mt-0">{line.substring(2)}</h1>)
                  } else if (line.startsWith('## ')) {
                    elements.push(<h2 key={key++} className="text-xl font-semibold mb-2 mt-3">{line.substring(3)}</h2>)
                  } else if (line.startsWith('### ')) {
                    elements.push(<h3 key={key++} className="text-lg font-medium mb-1 mt-2">{line.substring(4)}</h3>)
                  }
                  // Bold text
                  else if (line.includes('**')) {
                    const parts = line.split('**')
                    const processedParts = parts.map((part, index) =>
                      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                    )
                    elements.push(<p key={key++} className="mb-2">{processedParts}</p>)
                  }
                  // Italic text
                  else if (line.includes('*')) {
                    const parts = line.split('*')
                    const processedParts = parts.map((part, index) =>
                      index % 2 === 1 ? <em key={index}>{part}</em> : part
                    )
                    elements.push(<p key={key++} className="mb-2">{processedParts}</p>)
                  }
                  // Lists
                  else if (line.startsWith('- ') || line.startsWith('* ')) {
                    elements.push(<li key={key++} className="mb-1">{line.substring(2)}</li>)
                  }
                  // Empty lines
                  else if (line.trim() === '') {
                    // Skip empty lines, they'll be handled by margins
                  }
                  // Regular paragraphs
                  else {
                    elements.push(<p key={key++} className="mb-2">{line}</p>)
                  }
                }

                return elements
              }

              return (
                <div
                  className="min-h-[160px] text-sm font-mono  whitespace-pre-wrap bg-white border-none shadow-sm outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 px-6 py-6 rounded-tl rounded-tr-md"
                  onClick={onFocus}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onFocus()
                    }
                  }}
                >
                  {renderMarkdown(content)}
                </div>
              )
            } catch (error) {
              console.error('MDX rendering error:', error)
              return (
                <div
                  className="min-h-[160px] p-3 border border-input rounded-md bg-white cursor-text whitespace-pre-wrap pr-12"
                  onClick={onFocus}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onFocus()
                    }
                  }}
                >
                  {content}
                </div>
              )
            }
          })()
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 gap-1 h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity ${
            copiedStepIndex === stepIndex ? '' : ''
          }`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void handleCopyStep(
              {
                content: isEditing ? localContent : content,
                keywords: [],
                mediaPrompt: ''
              },
              stepIndex
            )
          }}
          onMouseDown={(e) => e.preventDefault()}
          title={copiedStepIndex === stepIndex ? "Copied!" : "Copy content"}
        >
          {copiedStepIndex === stepIndex ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  })

  return (
    <>
      <Head data-id="Head">
        <title>Create New Content | Studio | Jesus Film Project</title>
      </Head>
      <div className="min-h-screen bg-stone-100 text-foreground" data-id="PageRoot">
        <header className="border-b border-border bg-background backdrop-blur" data-id="Header">
          <div className="container mx-auto px-4 py-6" data-id="HeaderContainer">
            <div className="flex items-center justify-between" data-id="HeaderRow">
              <div className="flex items-center gap-4" data-id="HeaderBranding">
                <Image
                  src="/jesusfilm-sign.svg"
                  alt="Jesus Film Project"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
                <h1 className="text-2xl font-bold text-foreground">Studio</h1>
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
                <Card className="bg-transparent border-0 shadow-none">
                   
                  <CardHeader
                  className={`relative w-full transition-[max-height] duration-700 ease-out pt-0 ${
                    isContextContainerHidden
                      ? 'opacity-0 max-h-0 py-0 pointer-events-none pt-10'
                      : 'opacity-100 max-h-100  '
                  }`}>
                    <div className="flex items-start justify-between gap-8 mb-4" data-id="HeroRow">
                      <blockquote className="text-xl font-medium text-stone-950 text-balance w-full text-center z-30 animate-bible-quote-appear py-12" data-id="Verse">
                        &ldquo;Let your conversation be always{' '}
                        <span className="animate-gradient-wave animate-glow-delay">full&nbsp;of&nbsp;grace,
                        seasoned&nbsp;with&nbsp;salt</span>, so&nbsp;that&nbsp;you&nbsp;may know how to
                        answer everyone.&rdquo;
                        <cite className="block mt-2 text-sm font-medium text-stone-500">
                          Colossians 4:5–6
                        </cite>
                      </blockquote>
                      <p className="absolute block -bottom-40 text-center w-full text-sm font-medium text-stone-400 opacity-0 animate-fade-in-out [animation-delay:1200ms] z-100 uppercase tracking-widest" data-id="IntroLabel">
                        Introducing: Sharing Studio...
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
                    <div className="flex justify-between items-center mb-4">
                      <CardTitle
                      data-id="HeroTitle"
                      className="text-2xl text-left relative"
                      >
                        Share God's grace… <RotatingText
                          onCategoryChange={handleCategoryChange}
                          hoveredCategory={hoveredCategory}
                          isHovering={isHovering}
                          isAnimationStopped={isAnimationStopped}
                        />
                      </CardTitle>
                      <Button variant="link" size="sm" asChild className="">
                        <Link href="/studio" className="inline-flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          How it works
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent data-testid="section-channels" className="space-y-6" data-id="ChannelsSection">
                    {/* Context Selector */}
                    <div className="mb-8" data-id="ContextSelector">
                      <div
                        className="grid grid-cols-5 gap-4"
                        data-id="ContextGrid"
                        onMouseEnter={() => setIsTilesContainerHovered(true)}
                        onMouseLeave={() => setIsTilesContainerHovered(false)}
                        suppressHydrationWarning
                      >
                        {/* Conversations */}
                        <div
                          data-id="Tile-Conversations"
                          className={`${(collapsedTiles && !isTilesContainerHovered) ? 'p-3' : 'p-4'} border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${(collapsedTiles && !isTilesContainerHovered) ? 'gap-1' : 'gap-3'} ${
                            selectedContext === 'Conversations'
                              ? 'bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 border-blue-500'
                              : !isHovering && highlightedCategory === 'Conversations'
                                ? 'bg-transparent border-cyan-600'
                                : `bg-transparent border-gray-300 ${
                                    shouldShowHoverEffect('Conversations')
                                      ? 'hover:bg-gradient-to-br hover:from-blue-500 hover:via-cyan-600 hover:to-teal-600 hover:border-cyan-600'
                                      : ''
                                  }`
                          }`}
                          onClick={() => handleContextChange('Conversations')}
                          onMouseEnter={() => {
                            setHoveredCategory('Conversations')
                            setIsHovering(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredCategory(null)
                            setIsHovering(false)
                          }}
                        >
                          {!(collapsedTiles && !isTilesContainerHovered) && (
                            <div className="p-3" data-id="Tile-Conversations-Icon">
                              <MessageSquare
                                className={`w-8 h-8 ${
                                  selectedContext === 'Conversations'
                                    ? 'text-white drop-shadow-lg'
                                    : !isHovering && highlightedCategory === 'Conversations'
                                      ? 'text-cyan-600'
                                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                                }`}
                              />
                            </div>
                          )}
                          <span
                            data-id="Tile-Conversations-Label"
                            className={`font-medium text-sm text-center ${
                              selectedContext === 'Conversations'
                                ? 'text-white drop-shadow-lg'
                                : !isHovering && highlightedCategory === 'Conversations'
                                  ? 'text-cyan-600'
                                  : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                            }`}
                          >
                            <span className="inline md:hidden">Conv.</span><span className="hidden md:inline">Conversations</span>
                          </span>
                        </div>

                        {/* Social Media */}
                        <div
                          data-id="Tile-SocialMedia"
                          className={`${(collapsedTiles && !isTilesContainerHovered) ? 'p-2' : 'p-4'} border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${(collapsedTiles && !isTilesContainerHovered) ? 'gap-1' : 'gap-3'} ${
                            selectedContext === 'Social Media'
                              ? 'bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 border-purple-500'
                              : !isHovering && highlightedCategory === 'Social Media'
                                ? 'bg-transparent border-pink-500'
                                : `bg-transparent border-gray-300 ${
                                    shouldShowHoverEffect('Social Media')
                                      ? 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-600 hover:to-red-600 hover:border-pink-500'
                                      : ''
                                  }`
                          }`}
                          onClick={() => handleContextChange('Social Media')}
                          onMouseEnter={() => {
                            setHoveredCategory('Social Media')
                            setIsHovering(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredCategory(null)
                            setIsHovering(false)
                          }}
                        >
                          {!(collapsedTiles && !isTilesContainerHovered) && (
                            <div className="p-3" data-id="Tile-SocialMedia-Icon">
                              <Layers
                                className={`w-8 h-8 ${
                                  selectedContext === 'Social Media'
                                    ? 'text-white drop-shadow-lg'
                                    : !isHovering && highlightedCategory === 'Social Media'
                                      ? 'text-pink-500'
                                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                                }`}
                              />
                            </div>
                          )}
                          <span
                            data-id="Tile-SocialMedia-Label"
                            className={`font-medium text-sm text-center ${
                              selectedContext === 'Social Media'
                                ? 'text-white drop-shadow-lg'
                                : !isHovering && highlightedCategory === 'Social Media'
                                  ? 'text-pink-500'
                                  : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                            }`}
                          >
                            <span className="inline md:hidden">Social</span><span className="hidden md:inline">Social Media</span>
                          </span>
                        </div>

                        {/* Website */}
                        <div
                          data-id="Tile-Website"
                          className={`${(collapsedTiles && !isTilesContainerHovered) ? 'p-2' : 'p-4'} border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${(collapsedTiles && !isTilesContainerHovered) ? 'gap-1' : 'gap-3'} ${
                            selectedContext === 'Website'
                              ? 'bg-gradient-to-br from-orange-500 via-yellow-600 to-amber-600 border-orange-500'
                              : !isHovering && highlightedCategory === 'Website'
                                ? 'bg-transparent border-orange-500'
                                : `bg-transparent border-gray-300 ${
                                    shouldShowHoverEffect('Website')
                                      ? 'hover:bg-gradient-to-br hover:from-orange-500 hover:via-yellow-600 hover:to-amber-600 hover:border-orange-500'
                                      : ''
                                  }`
                          }`}
                          onClick={() => handleContextChange('Website')}
                          onMouseEnter={() => {
                            setHoveredCategory('Website')
                            setIsHovering(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredCategory(null)
                            setIsHovering(false)
                          }}
                        >
                          {!(collapsedTiles && !isTilesContainerHovered) && (
                            <div className="p-3" data-id="Tile-Website-Icon">
                              <Globe
                                className={`w-8 h-8 ${
                                  selectedContext === 'Website'
                                    ? 'text-white drop-shadow-lg'
                                    : !isHovering && highlightedCategory === 'Website'
                                      ? 'text-orange-500'
                                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                                }`}
                              />
                            </div>
                          )}
                          <span
                            data-id="Tile-Website-Label"
                            className={`font-medium text-sm text-center ${
                              selectedContext === 'Website'
                                ? 'text-white drop-shadow-lg'
                                : !isHovering && highlightedCategory === 'Website'
                                  ? 'text-orange-500'
                                  : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                            }`}
                          >
                            <span className="inline md:hidden">Web</span><span className="hidden md:inline">Website</span>
                          </span>
                        </div>

                        {/* Print */}
                        <div
                          data-id="Tile-Print"
                          className={`${(collapsedTiles && !isTilesContainerHovered) ? 'p-2' : 'p-4'} border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${(collapsedTiles && !isTilesContainerHovered) ? 'gap-1' : 'gap-3'} ${
                            selectedContext === 'Print'
                              ? 'bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600 border-emerald-500'
                              : !isHovering && highlightedCategory === 'Print'
                                ? 'bg-transparent border-emerald-500'
                                : `bg-transparent border-gray-300 ${
                                    shouldShowHoverEffect('Print')
                                      ? 'hover:bg-gradient-to-br hover:from-emerald-500 hover:via-green-600 hover:to-lime-600 hover:border-emerald-500'
                                      : ''
                                  }`
                          }`}
                          onClick={() => handleContextChange('Print')}
                          onMouseEnter={() => {
                            setHoveredCategory('Print')
                            setIsHovering(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredCategory(null)
                            setIsHovering(false)
                          }}
                        >
                          {!(collapsedTiles && !isTilesContainerHovered) && (
                            <div className="p-3" data-id="Tile-Print-Icon">
                              <FileText
                                className={`w-8 h-8 ${
                                  selectedContext === 'Print'
                                    ? 'text-white drop-shadow-lg'
                                    : !isHovering && highlightedCategory === 'Print'
                                      ? 'text-emerald-600'
                                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                                }`}
                              />
                            </div>
                          )}
                          <span
                            data-id="Tile-Print-Label"
                            className={`font-medium text-sm text-center ${
                              selectedContext === 'Print'
                                ? 'text-white drop-shadow-lg'
                                : !isHovering && highlightedCategory === 'Print'
                                  ? 'text-emerald-600'
                                  : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                            }`}
                          >
                            Print
                          </span>
                        </div>

                        {/* Real Life */}
                        <div
                          data-id="Tile-RealLife"
                          className={`${(collapsedTiles && !isTilesContainerHovered) ? 'p-2' : 'p-4'} border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center ${(collapsedTiles && !isTilesContainerHovered) ? 'gap-1' : 'gap-3'} ${
                            selectedContext === 'Real Life'
                              ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 border-rose-500'
                              : !isHovering && highlightedCategory === 'Real Life'
                                ? 'bg-transparent border-rose-500'
                                : `bg-transparent border-gray-300 ${
                                    shouldShowHoverEffect('Real Life')
                                      ? 'hover:bg-gradient-to-br hover:from-rose-500 hover:via-pink-600 hover:to-fuchsia-600 hover:border-rose-500'
                                      : ''
                                  }`
                          }`}
                          onClick={() => handleContextChange('Real Life')}
                          onMouseEnter={() => {
                            setHoveredCategory('Real Life')
                            setIsHovering(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredCategory(null)
                            setIsHovering(false)
                          }}
                        >
                          {!(collapsedTiles && !isTilesContainerHovered) && (
                            <div className="p-3">
                              <Users
                                className={`w-8 h-8 ${
                                  selectedContext === 'Real Life'
                                    ? 'text-white drop-shadow-lg'
                                    : !isHovering && highlightedCategory === 'Real Life'
                                      ? 'text-rose-500'
                                      : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                                }`}
                              />
                            </div>
                          )}
                          <span
                            className={`font-medium text-sm text-center ${
                              selectedContext === 'Real Life'
                                ? 'text-white drop-shadow-lg'
                                : !isHovering && highlightedCategory === 'Real Life'
                                  ? 'text-rose-500'
                                  : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                            }`}
                          >
                            <span className="inline md:hidden">Live</span><span className="hidden md:inline">Real Life</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div data-testid="section-prompt" data-id="PromptBlock" className={`relative ${selectedContext ? '' : 'hidden'} bg-white rounded-3xl shadow-xl `} suppressHydrationWarning>
                      {/* <label className="text-sm font-medium mb-2 block">Text Content</label> */}
                      <div className="relative">
                        {/* Image Attachments Carousel - inside textarea */}
                        {imageAttachments.length > 0 && (
                          <div className=" top-4 left-4 right-4 z-10">
                            <div className="flex gap-2 overflow-x-auto p-4">
                              {imageAttachments.map((imageSrc, index) => {
                                const analysis = imageAnalysisResults[index]
                                return (
                                  <div
                                    key={index}
                                    className="relative group flex-shrink-0"
                                  >
                                    <div className="aspect-square w-20 h-20 rounded-lg overflow-hidden bg-muted border shadow-sm">
                                      <Image
                                        src={imageSrc}
                                        alt={`Attached image ${index + 1}`}
                                        width={120}
                                        height={120}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    {/* Delete button - top right */}
                                    <button
                                      onClick={() => removeImage(index)}
                                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center shadow-sm hover:bg-black/80 transition-colors cursor-pointer z-10 text-xs"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3 text-white" />
                                    </button>

                                    {/* Info button - bottom left */}
                                    {analysis && !analysis.isAnalyzing && (
                                      <button
                                        onClick={() =>
                                          setSelectedImageForDetails(index)
                                        }
                                        className="absolute bottom-1.5 left-1.5 w-5 h-5 bg-white/90 text-black rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer z-10 text-xs"
                                        title="View analysis details"
                                      >
                                        <Info className="w-3 h-3" />
                                      </button>
                                    )}

                                    {/* Analysis indicator */}
                                    {analysis?.isAnalyzing && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <Textarea
                          ref={textareaRef}
                          placeholder="Enter your text content here... You can also paste or drop images directly."
                          className={`relative shadow-none resize-none bg-transparent pr-12 pb-16 px-4 border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 text-base scrollbar-hide min-h-[200px] h-auto overflow-y-hidden ${
                            animatingTextarea ? 'animate-text-appear' : ''
                          }`}
                          onPaste={handlePaste}
                          onKeyDown={(e) => {
                            if (
                              e.key === 'Enter' &&
                              (e.metaKey || e.ctrlKey) &&
                              (e.target as HTMLTextAreaElement).value.trim()
                            ) {
                              e.preventDefault()
                              setTextContent((e.target as HTMLTextAreaElement).value)
                              void handleSubmit()
                            }
                          }}
                        />

                        {/* Camera button - bottom left */}
                        <div className="absolute bottom-3 left-3">
                          <button
                            onClick={handleOpenCamera}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border-2 border-border bg-transparent text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                            title="Add image"
                            type="button"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Add Image</span>
                          </button>
                        </div>

                        {/* Action buttons - bottom right */}
                        <Dialog
                          open={isPersonaDialogOpen}
                          onOpenChange={setIsPersonaDialogOpen}
                        >
                          <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <DialogTrigger asChild>
                              <button
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border-2 border-border bg-transparent text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                                type="button"
                              >
                                <Users className="w-4 h-4" />
                                <span>Persona</span>
                              </button>
                            </DialogTrigger>
                            <button
                              onClick={() => {
                                void handleSubmit()
                              }}
                              className="px-4 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary/90 transition-colors group cursor-pointer"
                              type="button"
                            >
                              {isProcessing ? (
                                <AnimatedLoadingText />
                              ) : (
                                <>{aiResponse.trim() ? 'Retry' : 'Run'}&nbsp;&nbsp;&nbsp;&nbsp;⌘ + ↵</>
                              )}
                            </button>
                          </div>
                          <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                              <DialogTitle>Persona settings</DialogTitle>
                              <DialogDescription>
                                Define the audience or persona preferences that should guide the generated content.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="grid gap-4" onSubmit={handlePersonaSubmit}>
                              <div className="grid gap-1">
                                <label
                                  className="text-sm font-medium text-muted-foreground"
                                  htmlFor="persona-name"
                                >
                                  Persona name
                                </label>
                                <Input
                                  id="persona-name"
                                  value={personaSettings.personaName}
                                  onChange={handlePersonaFieldChange('personaName')}
                                  placeholder="e.g. Youth Pastor, College Student"
                                />
                              </div>
                              <div className="grid gap-1">
                                <label
                                  className="text-sm font-medium text-muted-foreground"
                                  htmlFor="persona-audience"
                                >
                                  Audience description
                                </label>
                                <Textarea
                                  id="persona-audience"
                                  value={personaSettings.audienceDescription}
                                  onChange={handlePersonaFieldChange('audienceDescription')}
                                  placeholder="Who are you speaking to? Include demographics, background, or interests."
                                  rows={3}
                                />
                              </div>
                              <div className="grid gap-1">
                                <label
                                  className="text-sm font-medium text-muted-foreground"
                                  htmlFor="persona-tone"
                                >
                                  Tone or style preferences
                                </label>
                                <Input
                                  id="persona-tone"
                                  value={personaSettings.tone}
                                  onChange={handlePersonaFieldChange('tone')}
                                  placeholder="e.g. Warm and encouraging, Bold and direct"
                                />
                              </div>
                              <div className="grid gap-1">
                                <label
                                  className="text-sm font-medium text-muted-foreground"
                                  htmlFor="persona-goals"
                                >
                                  Goals or desired response
                                </label>
                                <Textarea
                                  id="persona-goals"
                                  value={personaSettings.goals}
                                  onChange={handlePersonaFieldChange('goals')}
                                  placeholder="What do you want the audience to think, feel, or do?"
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsPersonaDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">Save persona</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
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

                    {/* Output Format Grid Selector */}
                    <div className="mt-12 hidden">
                      <div className="flex items-center gap-4 mb-4">
                        <label className="text-lg font-semibold">
                          Where will you share?
                        </label>
                        <span className="text-sm text-muted-foreground">
                          Select platforms and their optimal video formats
                        </span>
                      </div>
                      <div className="space-y-6">
                        {/* Instagram */}
                        <Accordion
                          title="Instagram"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Instagram className="w-6 h-6 text-pink-500" />}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Instagram',
                                  'Story / Reel / IGTV (Vertical): 1080 × 1920 px (9:16)',
                                  !selectedOutputs['Instagram']?.includes(
                                    'Story / Reel / IGTV (Vertical): 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Instagram']?.includes(
                                    'Story / Reel / IGTV (Vertical): 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Instagram',
                                    'Story / Reel / IGTV (Vertical): 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Story / Reel / IGTV (Vertical)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Instagram',
                                  'Feed Post (Square): 1080 × 1080 px (1:1)',
                                  !selectedOutputs['Instagram']?.includes(
                                    'Feed Post (Square): 1080 × 1080 px (1:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Instagram']?.includes(
                                    'Feed Post (Square): 1080 × 1080 px (1:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Instagram',
                                    'Feed Post (Square): 1080 × 1080 px (1:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Feed Post (Square)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1080 px (1:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Instagram',
                                  'Feed Post (Landscape): 1080 × 608 px (~16:9)',
                                  !selectedOutputs['Instagram']?.includes(
                                    'Feed Post (Landscape): 1080 × 608 px (~16:9)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Instagram']?.includes(
                                    'Feed Post (Landscape): 1080 × 608 px (~16:9)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Instagram',
                                    'Feed Post (Landscape): 1080 × 608 px (~16:9)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Feed Post (Landscape)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 608 px (~16:9)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* Facebook */}
                        <Accordion
                          title="Facebook"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Facebook className="w-6 h-6 text-blue-600" />}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Facebook',
                                  'Feed Video (Landscape): 1200 × 630 px (~1.91:1)',
                                  !selectedOutputs['Facebook']?.includes(
                                    'Feed Video (Landscape): 1200 × 630 px (~1.91:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Facebook']?.includes(
                                    'Feed Video (Landscape): 1200 × 630 px (~1.91:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Facebook',
                                    'Feed Video (Landscape): 1200 × 630 px (~1.91:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Feed Video (Landscape)
                                </div>
                                <div className="text-muted-foreground">
                                  1200 × 630 px (~1.91:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Facebook',
                                  'Feed Video (Square): 1080 × 1080 px (1:1)',
                                  !selectedOutputs['Facebook']?.includes(
                                    'Feed Video (Square): 1080 × 1080 px (1:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Facebook']?.includes(
                                    'Feed Video (Square): 1080 × 1080 px (1:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Facebook',
                                    'Feed Video (Square): 1080 × 1080 px (1:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Feed Video (Square)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1080 px (1:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Facebook',
                                  'Vertical Video: 1080 × 1920 px (9:16)',
                                  !selectedOutputs['Facebook']?.includes(
                                    'Vertical Video: 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Facebook']?.includes(
                                    'Vertical Video: 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Facebook',
                                    'Vertical Video: 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Vertical Video
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Facebook',
                                  'Cover Video: 820 × 462 px (16:9 cinematic crop)',
                                  !selectedOutputs['Facebook']?.includes(
                                    'Cover Video: 820 × 462 px (16:9 cinematic crop)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Facebook']?.includes(
                                    'Cover Video: 820 × 462 px (16:9 cinematic crop)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Facebook',
                                    'Cover Video: 820 × 462 px (16:9 cinematic crop)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">Cover Video</div>
                                <div className="text-muted-foreground">
                                  820 × 462 px (16:9 cinematic crop)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* YouTube */}
                        <Accordion
                          title="YouTube"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Youtube className="w-6 h-6 text-red-600" />}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'YouTube',
                                  'Standard Video: 1920 × 1080 px (16:9 Full HD)',
                                  !selectedOutputs['YouTube']?.includes(
                                    'Standard Video: 1920 × 1080 px (16:9 Full HD)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['YouTube']?.includes(
                                    'Standard Video: 1920 × 1080 px (16:9 Full HD)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'YouTube',
                                    'Standard Video: 1920 × 1080 px (16:9 Full HD)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Standard Video
                                </div>
                                <div className="text-muted-foreground">
                                  1920 × 1080 px (16:9 Full HD)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'YouTube',
                                  'Shorts (Vertical): 1080 × 1920 px (9:16)',
                                  !selectedOutputs['YouTube']?.includes(
                                    'Shorts (Vertical): 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['YouTube']?.includes(
                                    'Shorts (Vertical): 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'YouTube',
                                    'Shorts (Vertical): 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Shorts (Vertical)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'YouTube',
                                  '4K UHD: 3840 × 2160 px (16:9)',
                                  !selectedOutputs['YouTube']?.includes(
                                    '4K UHD: 3840 × 2160 px (16:9)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['YouTube']?.includes(
                                    '4K UHD: 3840 × 2160 px (16:9)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'YouTube',
                                    '4K UHD: 3840 × 2160 px (16:9)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">4K UHD</div>
                                <div className="text-muted-foreground">
                                  3840 × 2160 px (16:9)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* LinkedIn */}
                        <Accordion
                          title="LinkedIn"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Users className="w-6 h-6 text-blue-700" />}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'LinkedIn',
                                  'Feed Video (Landscape): 1200 × 627 px (~1.91:1)',
                                  !selectedOutputs['LinkedIn']?.includes(
                                    'Feed Video (Landscape): 1200 × 627 px (~1.91:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['LinkedIn']?.includes(
                                    'Feed Video (Landscape): 1200 × 627 px (~1.91:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'LinkedIn',
                                    'Feed Video (Landscape): 1200 × 627 px (~1.91:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Feed Video (Landscape)
                                </div>
                                <div className="text-muted-foreground">
                                  1200 × 627 px (~1.91:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'LinkedIn',
                                  'Feed Video (Square): 1080 × 1080 px (1:1)',
                                  !selectedOutputs['LinkedIn']?.includes(
                                    'Feed Video (Square): 1080 × 1080 px (1:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['LinkedIn']?.includes(
                                    'Feed Video (Square): 1080 × 1080 px (1:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'LinkedIn',
                                    'Feed Video (Square): 1080 × 1080 px (1:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Feed Video (Square)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1080 px (1:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'LinkedIn',
                                  'Stories (Vertical): 1080 × 1920 px (9:16)',
                                  !selectedOutputs['LinkedIn']?.includes(
                                    'Stories (Vertical): 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['LinkedIn']?.includes(
                                    'Stories (Vertical): 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'LinkedIn',
                                    'Stories (Vertical): 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Stories (Vertical)
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* Twitter (X) */}
                        <Accordion
                          title="Twitter (X)"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<X className="w-6 h-6 text-gray-800" />}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Twitter',
                                  'Landscape Video: 1600 × 900 px (16:9)',
                                  !selectedOutputs['Twitter']?.includes(
                                    'Landscape Video: 1600 × 900 px (16:9)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Twitter']?.includes(
                                    'Landscape Video: 1600 × 900 px (16:9)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Twitter',
                                    'Landscape Video: 1600 × 900 px (16:9)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Landscape Video
                                </div>
                                <div className="text-muted-foreground">
                                  1600 × 900 px (16:9)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Twitter',
                                  'Square Video: 1080 × 1080 px (1:1)',
                                  !selectedOutputs['Twitter']?.includes(
                                    'Square Video: 1080 × 1080 px (1:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Twitter']?.includes(
                                    'Square Video: 1080 × 1080 px (1:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Twitter',
                                    'Square Video: 1080 × 1080 px (1:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">Square Video</div>
                                <div className="text-muted-foreground">
                                  1080 × 1080 px (1:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Twitter',
                                  'Vertical Video: 1080 × 1920 px (9:16)',
                                  !selectedOutputs['Twitter']?.includes(
                                    'Vertical Video: 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Twitter']?.includes(
                                    'Vertical Video: 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Twitter',
                                    'Vertical Video: 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Vertical Video
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* TikTok */}
                        <Accordion
                          title="TikTok"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Video className="w-6 h-6 text-black" />}
                        >
                          <div className="grid grid-cols-1 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'TikTok',
                                  'Standard Vertical Video: 1080 × 1920 px (9:16)',
                                  !selectedOutputs['TikTok']?.includes(
                                    'Standard Vertical Video: 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['TikTok']?.includes(
                                    'Standard Vertical Video: 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'TikTok',
                                    'Standard Vertical Video: 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Standard Vertical Video
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* Pinterest */}
                        <Accordion
                          title="Pinterest"
                          defaultOpen={false}
                          className="border-muted"
                          icon={
                            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                P
                              </span>
                            </div>
                          }
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Pinterest',
                                  'Standard Pin Video: 1000 × 1500 px (2:3)',
                                  !selectedOutputs['Pinterest']?.includes(
                                    'Standard Pin Video: 1000 × 1500 px (2:3)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Pinterest']?.includes(
                                    'Standard Pin Video: 1000 × 1500 px (2:3)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Pinterest',
                                    'Standard Pin Video: 1000 × 1500 px (2:3)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Standard Pin Video
                                </div>
                                <div className="text-muted-foreground">
                                  1000 × 1500 px (2:3)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Pinterest',
                                  'Square Video: 1000 × 1000 px (1:1)',
                                  !selectedOutputs['Pinterest']?.includes(
                                    'Square Video: 1000 × 1000 px (1:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Pinterest']?.includes(
                                    'Square Video: 1000 × 1000 px (1:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Pinterest',
                                    'Square Video: 1000 × 1000 px (1:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">Square Video</div>
                                <div className="text-muted-foreground">
                                  1000 × 1000 px (1:1)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Pinterest',
                                  'Vertical Video: 1080 × 1920 px (9:16)',
                                  !selectedOutputs['Pinterest']?.includes(
                                    'Vertical Video: 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Pinterest']?.includes(
                                    'Vertical Video: 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Pinterest',
                                    'Vertical Video: 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Vertical Video
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* Snapchat */}
                        <Accordion
                          title="Snapchat"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Camera className="w-6 h-6 text-yellow-500" />}
                        >
                          <div className="grid grid-cols-1 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Snapchat',
                                  'Standard Vertical Video: 1080 × 1920 px (9:16)',
                                  !selectedOutputs['Snapchat']?.includes(
                                    'Standard Vertical Video: 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Snapchat']?.includes(
                                    'Standard Vertical Video: 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Snapchat',
                                    'Standard Vertical Video: 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  Standard Vertical Video
                                </div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>

                        {/* Universal Video Formats */}
                        <Accordion
                          title="Universal Video Formats"
                          defaultOpen={false}
                          className="border-muted"
                          icon={<Globe className="w-6 h-6 text-green-600" />}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Universal',
                                  'Full HD: 1920 × 1080 px (16:9)',
                                  !selectedOutputs['Universal']?.includes(
                                    'Full HD: 1920 × 1080 px (16:9)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Universal']?.includes(
                                    'Full HD: 1920 × 1080 px (16:9)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Universal',
                                    'Full HD: 1920 × 1080 px (16:9)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">Full HD</div>
                                <div className="text-muted-foreground">
                                  1920 × 1080 px (16:9)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Universal',
                                  '4K UHD: 3840 × 2160 px (16:9)',
                                  !selectedOutputs['Universal']?.includes(
                                    '4K UHD: 3840 × 2160 px (16:9)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Universal']?.includes(
                                    '4K UHD: 3840 × 2160 px (16:9)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Universal',
                                    '4K UHD: 3840 × 2160 px (16:9)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">4K UHD</div>
                                <div className="text-muted-foreground">
                                  3840 × 2160 px (16:9)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Universal',
                                  'Vertical HD: 1080 × 1920 px (9:16)',
                                  !selectedOutputs['Universal']?.includes(
                                    'Vertical HD: 1080 × 1920 px (9:16)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Universal']?.includes(
                                    'Vertical HD: 1080 × 1920 px (9:16)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Universal',
                                    'Vertical HD: 1080 × 1920 px (9:16)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">Vertical HD</div>
                                <div className="text-muted-foreground">
                                  1080 × 1920 px (9:16)
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                handleOutputChange(
                                  'Universal',
                                  'Square HD: 1080 × 1080 px (1:1)',
                                  !selectedOutputs['Universal']?.includes(
                                    'Square HD: 1080 × 1080 px (1:1)'
                                  )
                                )
                              }
                            >
                              <Checkbox
                                checked={
                                  selectedOutputs['Universal']?.includes(
                                    'Square HD: 1080 × 1080 px (1:1)'
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleOutputChange(
                                    'Universal',
                                    'Square HD: 1080 × 1080 px (1:1)',
                                    checked
                                  )
                                }
                              />
                              <div className="text-sm">
                                <div className="font-medium">Square HD</div>
                                <div className="text-muted-foreground">
                                  1080 × 1080 px (1:1)
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion>
                      </div>
                    </div>

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
                          <Card className="border shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-base font-semibold">
                                Raw AI Response
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <Textarea
                                  value={aiResponse}
                                  readOnly
                                  className="min-h-[200px] whitespace-pre-wrap"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </Accordion>

                        {editableSteps.length > 0 && (
                          <>
                            <div id="parsed-multi-step-content" className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-row gap-2">
                                <h3 className="flex items-center text-2xl font-medium">
                                Content draft
                                </h3>
                                </div>
                                <p>
                                  
                                  {parsedContentHeadingSuffix && (
                                    <span className="text-muted-foreground text-sm font-normal">
                                      {selectedDetailOption.emoji} Task:  {parsedContentHeadingSuffix}
                                    </span>
                                  )}
                                </p>
                              
                            </div>
                            <div className="grid gap-6">
                              <StepsList
                                editableSteps={editableSteps}
                                editingStepIndices={editingStepIndices}
                                stepHandlers={stepHandlers}
                                copiedStepIndex={copiedStepIndex}
                                unsplashImages={unsplashImages}
                                onImageSelection={handleImageSelection}
                              />
                            </div>
                          </>
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

                    {/* Original Images Section - kept for reference */}
                    <div className="mt-12 hidden">
                      <label className="text-sm font-medium mb-2 block">
                        Browse Images
                      </label>
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {/* Demo images carousel */}
                        <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src="https://images.unsplash.com/photo-1696229571968-6fbe217d812a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmFja2dyb3VuZCUyMHZlcnRpY2FsfGVufDB8fDB8fHww"
                            alt="Demo image 1"
                            width={128}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src="https://images.unsplash.com/photo-1752870240378-09b4f326ce67?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJhY2tncm91bmQlMjB2ZXJ0aWNhbHxlbnwwfHwwfHx8MA%3D%3D"
                            alt="Demo image 2"
                            width={128}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src="https://images.unsplash.com/photo-1667668060308-49e3c0583367?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJhY2tncm91bmQlMjB2ZXJ0aWNhbHxlbnwwfHwwfHx8MA%3D%3D"
                            alt="Demo image 3"
                            width={128}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Add new image button */}
                        <button className="flex-shrink-0 w-32 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center group cursor-pointer">
                          <Plus className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Context detail options */}

            {selectedContextOptions.length > 0 && (
              <div className={`mb-8 max-w-4xl mx-auto px-6 transition-all duration-500 ease-out ${
                hidingSuggestionsCarousel ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-96'
              }`}>
                <Carousel data-id="SuggestionTilesContainer" className="relative w-full" opts={{ align: 'start' }}>
                  <CarouselContent>
                    {selectedContextOptions.map((option, index) => {
                      const isSelected = selectedContextDetail === option.text

                      return (
                        <CarouselItem
                          key={option.text}
                          className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/5 xl:basis-1/5 py-2"
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
                            className={`group relative flex h-full w-full flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all duration-300 cursor-pointer hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent aspect-square ${
                              isSelected
                                ? 'border-primary shadow-lg ring-2 ring-primary/60'
                                : 'border-gray-200 hover:border-white hover:shadow-md'
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
                            <span className="text-4xl" aria-hidden="true">
                              {option.emoji}
                            </span>
                            <span className="mt-auto text-sm font-semibold text-balance leading-snug text-gray-900 line-clamp-4">
                              {option.text}
                            </span>
                          </button>
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="-left-6 hidden md:flex" />
                  <CarouselNext className="-right-6 hidden md:flex" />
                </Carousel>
              </div>
            )}

          {/* Step 2: Style */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Style</CardTitle>
                  <p className="text-muted-foreground">
                    Choose your design style
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {styleOptions.map((style) => {
                      const IconComponent = style.icon
                      return (
                        <Button
                          key={style.name}
                          variant="outline"
                          className="h-20 flex flex-col items-center justify-center gap-2"
                        >
                          <IconComponent className="w-6 h-6" />
                          <span className="text-sm">{style.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    (Select one or more styles for your content)
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Output */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Output</CardTitle>
                  <p className="text-muted-foreground">
                    Select the formats you want to generate
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="video" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger
                        value="video"
                        className="flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger
                        value="social"
                        className="flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Social
                      </TabsTrigger>
                      <TabsTrigger
                        value="print"
                        className="flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </TabsTrigger>
                      <TabsTrigger
                        value="web"
                        className="flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        Web
                      </TabsTrigger>
                    </TabsList>

                    {Object.entries(outputOptions).map(
                      ([category, options]) => (
                        <TabsContent
                          key={category}
                          value={category}
                          className="mt-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {options.map((option) => {
                              const IconComponent = option.icon
                              return (
                                <div
                                  key={option.name}
                                  className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={`${category}-${option.name}`}
                                    checked={(
                                      selectedOutputs[category] || []
                                    ).includes(option.name)}
                                    onCheckedChange={(checked) =>
                                      handleOutputChange(
                                        category,
                                        option.name,
                                        checked
                                      )
                                    }
                                  />
                                  <IconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                  <label
                                    htmlFor={`${category}-${option.name}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                  >
                                    {option.name}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </TabsContent>
                      )
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
