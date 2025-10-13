import {
  Camera,
  Crown,
  Facebook,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  Info,
  Instagram,
  Laugh,
  type LucideIcon,
  MessageCircle,
  MessageSquare,
  Palette,
  Paperclip,
  Pepper,
  Plus,
  Printer,
  Salt,
  Settings,
  Sparkles,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap
} from 'lucide-react'
import Head from 'next/head'
import Image from 'next/image'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

import { Accordion } from '../src/components/ui/accordion'
import { Button } from '../src/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../src/components/ui/card'
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
import { type UserInputData, userInputStorage } from '../src/libs/storage'

const steps = [
  { id: 1, title: 'Content', description: 'What do you want to share?' },
  { id: 2, title: 'Style', description: 'Choose your design style' },
  { id: 3, title: 'Output', description: 'Select output formats' }
]

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
  'Chat/Comments': [
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

const generationLabels = [
  'Boomer',
  'Gen X',
  'Millennial',
  'Gen Z',
  'Gen Alpha'
] as const

const personaGenderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Mixed audience', value: 'mixed' }
] as const

const personaRelationshipOptions = [
  { label: "Don't know yet", value: 'unknown' },
  { label: 'Friend', value: 'friend' },
  { label: 'Family', value: 'family' },
  { label: 'Coworker', value: 'coworker' },
  { label: 'Neighbor', value: 'neighbor' },
  { label: 'Ministry contact', value: 'ministry' }
] as const

const personaToneOptions: Array<{
  value: string
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    value: 'serious',
    label: '0 jokes',
    description: 'Keep it sincere and thoughtful.',
    icon: Salt
  },
  {
    value: 'memes',
    label: 'Memes x2',
    description: 'Use playful humor and modern references.',
    icon: Laugh
  },
  {
    value: 'pepTalk',
    label: 'Pep talk',
    description: 'Encourage them with warmth and energy.',
    icon: Pepper
  }
]

const RotatingText = ({
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
    // Chat/Comments - Blue gradient
    {
      text: 'in a text with your friends',
      category: 'Chat/Comments',
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
      category: 'Chat/Comments',
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
      category: 'Chat/Comments',
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
      category: 'Chat/Comments',
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
      category: 'Chat/Comments',
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
        'Chat/Comments': 'text-cyan-600',
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
}

export default function NewPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [selectedContext, setSelectedContext] = useState<string>('')
  const [isContextContainerHidden, setIsContextContainerHidden] = useState<boolean>(false)
  const [highlightedCategory, setHighlightedCategory] = useState<string>('')
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [isAnimationStopped, setIsAnimationStopped] = useState<boolean>(false)
  const [selectedOutputs, setSelectedOutputs] = useState<
    Record<string, string[]>
  >({})
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageAttachments, setImageAttachments] = useState<string[]>([])
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
  const [showContextMenu, setShowContextMenu] = useState(false)
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
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<string>>(
    new Set()
  )
  const [showTestimonialBackground, setShowTestimonialBackground] =
    useState(true)
  const [personaName, setPersonaName] = useState('')
  const [personaGenerationIndex, setPersonaGenerationIndex] = useState(2)
  const [personaGender, setPersonaGender] = useState<
    (typeof personaGenderOptions)[number]['value']
  >('mixed')
  const [personaRelationship, setPersonaRelationship] = useState<
    (typeof personaRelationshipOptions)[number]['value']
  >('unknown')
  const [personaTones, setPersonaTones] = useState<string[]>([])
  const [personaScreenshotFile, setPersonaScreenshotFile] =
    useState<File | null>(null)
  const [personaScreenshotPreview, setPersonaScreenshotPreview] =
    useState<string | null>(null)
  const [personaNotes, setPersonaNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!personaScreenshotFile) {
      setPersonaScreenshotPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(personaScreenshotFile)
    setPersonaScreenshotPreview(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [personaScreenshotFile])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showContextMenu &&
        !(event.target as Element).closest('.context-menu-container')
      ) {
        setShowContextMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showContextMenu])

  // Load saved data on mount
  useEffect(() => {
    const allSessions = userInputStorage.getAllSessions()
    setSavedSessions(allSessions)

    // Load draft if no current session
    const draft = userInputStorage.loadDraft()
    if (draft) {
      setTextContent(draft.textContent)
      setImageAttachments(draft.images)
      setAiResponse(draft.aiResponse || '')
      setImageAnalysisResults(
        draft.imageAnalysisResults.map((result) => ({
          ...result,
          contentIdeas: result.contentIdeas || [],
          isAnalyzing: false
        }))
      )
    }
  }, [])

  // Load OpenAI API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem(
        'jesus-film-studio-openai-api-key'
      )
      if (savedApiKey) {
        setOpenaiApiKey(savedApiKey)
      }
    }
  }, [])

  // Save OpenAI API key to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && openaiApiKey) {
      localStorage.setItem('jesus-film-studio-openai-api-key', openaiApiKey)
    }
  }, [openaiApiKey])

  // Auto-save draft when content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Only save if there's actual content to save
        const hasContent = textContent?.trim() || imageAttachments.length > 0
        if (hasContent) {
          userInputStorage.autoSaveDraft({
            textContent: textContent || '',
            images: imageAttachments,
            aiResponse: aiResponse || '',
            imageAnalysisResults: imageAnalysisResults || []
          })
        }
      } catch (error) {
        console.error('Failed to auto-save draft in useEffect:', error)
        // Don't let auto-save errors crash the app
      }
    }, 1000) // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId)
  }, [textContent, imageAttachments, aiResponse, imageAnalysisResults])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
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

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      // Automatically save session when reaching the final step
      if (nextStep === steps.length) {
        userInputStorage.saveCurrentSession({
          textContent,
          images: imageAttachments,
          aiResponse,
          imageAnalysisResults: imageAnalysisResults.map((result) => ({
            imageSrc: result.imageSrc,
            contentType: result.contentType,
            extractedText: result.extractedText,
            detailedDescription: result.detailedDescription,
            confidence: result.confidence,
            contentIdeas: result.contentIdeas
          }))
        })
        setSavedSessions(userInputStorage.getAllSessions())
        // Clear draft since session is now saved
        userInputStorage.clearDraft()
      }
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

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
  }

  const handleContextChange = (context: string) => {
    setSelectedContext(context)
    setIsContextContainerHidden(true)
    setHighlightedCategory('') // Stop automatic highlight animation when a tile is selected
    setIsAnimationStopped(true) // Stop the rotating text animation
  }

  const handlePersonaScreenshotChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null
    setPersonaScreenshotFile(file)
  }

  const removePersonaScreenshot = () => {
    setPersonaScreenshotFile(null)
  }

  const togglePersonaTone = (tone: string) => {
    setPersonaTones((previous) =>
      previous.includes(tone)
        ? previous.filter((value) => value !== tone)
        : [...previous, tone]
    )
  }

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

    // System message with base instructions
    messages.push({
      role: 'system',
      content: `You are a content creation assistant for Jesus Film Project. Based on the user's devotional content, create an engaging and shareable version that:

1. Maintains the core spiritual message
2. Makes it suitable for social media sharing
3. Encourages reflection and engagement
4. Keeps it concise and impactful
5. Uses warm, inviting language

When refining or improving content, consider:
- Previous AI responses may show patterns in content style and messaging
- Maintain consistency with your previous suggestions
- Build upon rather than contradict earlier improvements
- If no previous context is available, proceed with standard enhancement`
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

    // Add image analysis context if available (only for first message in conversation)
    if (messages.length === 1 && imageAnalysisResults.length > 0) {
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

      messages[0].content += imageContext
    }

    return messages
  }

  const processContentWithAI = async () => {
    if (!textContent.trim()) {
      alert('Please enter some content to process.')
      return
    }

    if (!openaiApiKey) {
      alert('Please set your OpenAI API key in settings first.')
      setIsSettingsOpen(true)
      return
    }

    setIsProcessing(true)
    const previousResponse = aiResponse
    setAiResponse('')

    try {
      // Build conversation history for proper chat context
      const messages = buildConversationHistory()

      // Add the current user input (or refinement request)
      const currentUserMessage = textContent.trim()
      messages.push({
        role: 'user',
        content: currentUserMessage
      })

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-5-nano',
            messages: messages
            //   max_completion_tokens: 2000,
            //   temperature: 0.9,
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to process content')
      }

      const data = await response.json()
      const processedContent =
        data.choices[0]?.message?.content || 'No response generated'
      setAiResponse(processedContent)

      // Track token usage
      if (data.usage) {
        setTotalTokensUsed((prev) => ({
          input: prev.input + (data.usage.prompt_tokens || 0),
          output: prev.output + (data.usage.completion_tokens || 0)
        }))
      }
    } catch (error) {
      console.error('Error processing content:', error)
      // Restore previous response if API call failed
      setAiResponse(previousResponse)
      alert(
        'Failed to process content. Please check your API key and try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeImageWithAI = async (imageSrc: string, imageIndex: number) => {
    if (!openaiApiKey) {
      console.warn('OpenAI API key not set, skipping image analysis')
      return
    }

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
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`
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
        }
      )

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const data = await response.json()
      let analysisText = data.choices[0]?.message?.content || '{}'

      // Track token usage
      if (data.usage) {
        setTotalTokensUsed((prev) => ({
          input: prev.input + (data.usage.prompt_tokens || 0),
          output: prev.output + (data.usage.completion_tokens || 0)
        }))
      }

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
        console.error('Raw response:', data.choices[0]?.message?.content)
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
          detailedDescription:
            'Failed to analyze image. Please check your API key.',
          confidence: 'low',
          contentIdeas: [],
          isAnalyzing: false
        }
        return updated
      })
    }
  }

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) return

    imageFiles.forEach((file, fileIndex) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert(
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

  const handleFileSelect = () => {
    setShowContextMenu(!showContextMenu)
  }

  const handlePhotosAndFiles = () => {
    setShowContextMenu(false)
    fileInputRef.current?.click()
  }

  const handleLinkToSite = () => {
    setShowContextMenu(false)
    // For now, just show a placeholder - you could implement URL input dialog here
    const url = prompt('Enter website URL:')
    if (url) {
      // You could add this to attachments or handle it differently
      alert(`Link to site: ${url} - This feature can be implemented further`)
    }
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
    if (textContent.trim()) {
      await processContentWithAI()
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
    setTextContent(session.textContent)
    setImageAttachments(session.images)
    setAiResponse(session.aiResponse || '')
    setImageAnalysisResults(
      session.imageAnalysisResults.map((result) => ({
        ...result,
        contentIdeas: result.contentIdeas || [],
        isAnalyzing: false
      }))
    )

    // Clear draft since we're loading a saved session
    userInputStorage.clearDraft()
  }

  const deleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      userInputStorage.deleteSession(sessionId)
      setSavedSessions(userInputStorage.getAllSessions())
    }
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

  return (
    <>
      <Head>
        <title>Create New Content | Studio | Jesus Film Project</title>
      </Head>
      <div className="min-h-screen bg-stone-100 text-foreground">
        <header className="border-b border-border bg-background backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src="/jesusfilm-sign.svg"
                  alt="Jesus Film Project"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
                <h1 className="text-2xl font-bold text-foreground">Studio</h1>
              </div>
              <div className="flex items-center gap-4">
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
                        <label
                          htmlFor="openai-api-key"
                          className="text-sm font-medium"
                        >
                          OpenAI API Key
                        </label>
                        <Input
                          id="openai-api-key"
                          type="password"
                          placeholder="Enter your OpenAI API key..."
                          value={openaiApiKey}
                          onChange={(e) => setOpenaiApiKey(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Your API key is required to process content with
                          OpenAI. It will be stored locally in your browser.
                        </p>
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
                                  No analysis available. Please configure your
                                  OpenAI API key in settings to enable image
                                  analysis.
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
        <div className="border-b border-border bg-stone-100 hidden">
          <div className="container mx-auto px-4 py-6">
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

        {/* Previous Requests Accordion */}
        {savedSessions.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <Accordion
              title="Your Previous Sessions"
              defaultOpen={false}
              className="border-muted"
              icon={<History className="w-4 h-4 text-muted-foreground" />}
            >
              <div className="space-y-3">
                {savedSessions.map((session) => (
                  <Card key={session.id} className="p-3 border-muted">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {session.textContent.substring(0, 60)}...
                          </h4>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>
                            {new Date(session.timestamp).toLocaleString()}
                          </p>
                          <p>
                            {session.images.length} images •{' '}
                            {session.aiResponse
                              ? 'Has AI response'
                              : 'No AI response'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadSession(session)}
                          className="h-7 px-2 text-xs"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSession(session.id)}
                          className="h-7 px-2 text-xs text-primary hover:text-primary"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Accordion>
          </div>
        )}

        <main
          className="container mx-auto px-4 py-12 relative"
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
              <div className="max-w-4xl mx-auto">
                <Card className="bg-transparent border-0 shadow-none">
                  <CardHeader className="text-center mb-6 relative">
                    <blockquote className="text-xl font-medium text-stone-950 mb-4 text-balance z-30 animate-bible-quote-appear">
                      &ldquo;Let your conversation be always{' '}
                      <span className="animate-glow-delay">full&nbsp;of&nbsp;grace</span>,
                      seasoned&nbsp;with&nbsp;salt, so that you may know how to
                      answer everyone.&rdquo;
                      <cite className="block mt-2 text-sm font-medium text-stone-500 opacity-0 animate-fade-in-up  [animation-delay:400ms]">
                        Colossians 4:5–6
                      </cite>
                    </blockquote>

                    <p className="absolute block -bottom-40 text-center w-full text-sm font-medium text-stone-400 opacity-0 animate-fade-in-out [animation-delay:1200ms] z-100 uppercase tracking-widest">
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
                  </CardHeader>
                </Card>
              </div>

              <hr className="w-full border-t border-stone-200 my-8" />

              <div className={`max-w-4xl mx-auto transition-all duration-500 ease-in-out}`}>
                <Card className="bg-transparent border-0 shadow-none">
                  <CardHeader
                  className={`ext-left w-full transition-all duration-500 ease-out ${
                    isContextContainerHidden
                      ? 'opacity-0 max-h-0 py-0 pointer-events-none'
                      : 'opacity-100 max-h-full  '
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <CardTitle className="text-2xl">
                        Share God's grace… <br />
                        <RotatingText
                          onCategoryChange={setHighlightedCategory}
                          hoveredCategory={hoveredCategory}
                          isHovering={isHovering}
                          isAnimationStopped={isAnimationStopped}
                        />
                      </CardTitle>
                      {/* <p className="text-sm text-muted-foreground text-right">Choose where you will share today's message</p> */}
                    </div>
                  </CardHeader>
                  <CardContent data-testid="section-channels" className="space-y-6">
                    {/* Context Selector */}
                    <div className="mb-8">
                      <div className="grid grid-cols-5 gap-4">
                        {/* Chat/Comments */}
                        <div
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
                            selectedContext === 'Chat/Comments'
                              ? 'bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 border-blue-500'
                              : !isHovering && highlightedCategory === 'Chat/Comments'
                                ? 'bg-transparent border-cyan-600'
                                : `bg-transparent border-gray-300 ${
                                    shouldShowHoverEffect('Chat/Comments')
                                      ? 'hover:bg-gradient-to-br hover:from-blue-500 hover:via-cyan-600 hover:to-teal-600 hover:border-cyan-600'
                                      : ''
                                  }`
                          }`}
                          onClick={() => handleContextChange('Chat/Comments')}
                          onMouseEnter={() => {
                            setHoveredCategory('Chat/Comments')
                            setIsHovering(true)
                          }}
                          onMouseLeave={() => {
                            setHoveredCategory(null)
                            setIsHovering(false)
                          }}
                        >
                          <div className="p-3">
                            <MessageSquare
                              className={`w-8 h-8 ${
                                selectedContext === 'Chat/Comments'
                                  ? 'text-white drop-shadow-lg'
                                  : !isHovering && highlightedCategory === 'Chat/Comments'
                                    ? 'text-cyan-600'
                                    : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                              }`}
                            />
                          </div>
                          <span
                            className={`font-medium text-sm text-center ${
                              selectedContext === 'Chat/Comments'
                                ? 'text-white drop-shadow-lg'
                                : !isHovering && highlightedCategory === 'Chat/Comments'
                                  ? 'text-cyan-600'
                                  : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                            }`}
                          >
                            <span className="inline md:hidden">Chat</span><span className="hidden md:inline">Chat Comments</span>
                          </span>
                        </div>

                        {/* Social Media */}
                        <div
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
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
                          <div className="p-3">
                            <Users
                              className={`w-8 h-8 ${
                                selectedContext === 'Social Media'
                                  ? 'text-white drop-shadow-lg'
                                  : !isHovering && highlightedCategory === 'Social Media'
                                    ? 'text-pink-500'
                                    : 'text-black group-hover:text-white group-hover:drop-shadow-lg'
                              }`}
                            />
                          </div>
                          <span
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
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
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
                          <div className="p-3">
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
                          <span
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
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
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
                          <div className="p-3">
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
                          <span
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
                          className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center gap-3 ${
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

                    {selectedContext && (
                      <Card className="mt-10 border border-stone-200 bg-white/80 shadow-xl backdrop-blur-sm">
                        <CardHeader className="space-y-3 pb-0">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <Users className="h-5 w-5 text-stone-500" />
                            Tell us about who you're serving
                          </CardTitle>
                          <CardDescription className="text-sm text-stone-500">
                            To be relevant we need to learn more about the person (audience) who will receive this {selectedContext}{' '}
                            content.
                          </CardDescription>
                          <div className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Channel:
                            <span className="ml-2 text-stone-900">{selectedContext}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                            <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/80 p-6 text-center">
                              {personaScreenshotPreview ? (
                                <div className="flex flex-col items-center gap-4">
                                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow">
                                    <Image
                                      src={personaScreenshotPreview}
                                      alt="Persona screenshot preview"
                                      fill
                                      sizes="128px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removePersonaScreenshot}
                                    className="h-auto rounded-full border-stone-300 bg-white/90 px-4 py-2 text-xs font-semibold text-stone-600 hover:border-stone-400 hover:text-stone-900"
                                  >
                                    <X className="h-4 w-4" />
                                    Remove screenshot
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-4">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-inner">
                                    <Camera className="h-8 w-8 text-stone-400" />
                                  </div>
                                  <div className="text-sm font-semibold text-stone-700">
                                    Paste their profile screenshot
                                  </div>
                                </div>
                              )}
                              <label className="mt-6 flex w-full cursor-pointer flex-col gap-2 text-sm font-medium text-stone-600">
                                <span className="text-xs uppercase tracking-wide text-stone-500">
                                  Upload or paste an image
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePersonaScreenshotChange}
                                  className="w-full cursor-pointer rounded-full border border-dashed border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:border-stone-400"
                                />
                              </label>
                              <p className="mt-3 text-xs text-muted-foreground">
                                Or fill out the persona manually using the fields on the right.
                              </p>
                            </div>
                            <div className="space-y-6">
                              <div>
                                <label className="text-sm font-semibold text-stone-700">
                                  Persona name or role
                                </label>
                                <Input
                                  value={personaName}
                                  onChange={(event) => setPersonaName(event.target.value)}
                                  placeholder="e.g. Ana, a college sophomore curious about faith"
                                  className="mt-2 h-11 rounded-xl border-stone-300 bg-white/90"
                                />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm font-medium text-stone-700">
                                  <span>Generation</span>
                                  <span className="text-stone-500">
                                    {generationLabels[personaGenerationIndex]}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={generationLabels.length - 1}
                                  step={1}
                                  value={personaGenerationIndex}
                                  onChange={(event) =>
                                    setPersonaGenerationIndex(Number(event.target.value))
                                  }
                                  className="w-full accent-stone-900"
                                />
                                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                                  {generationLabels.map((label, index) => (
                                    <span
                                      key={label}
                                      className={
                                        index === personaGenerationIndex
                                          ? 'text-stone-900'
                                          : undefined
                                      }
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <p className="text-sm font-semibold text-stone-700">
                                    Gender emphasis
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {personaGenderOptions.map((option) => (
                                      <Button
                                        key={option.value}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPersonaGender(option.value)}
                                        className={`h-auto rounded-full border-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                                          personaGender === option.value
                                            ? 'border-stone-900 bg-stone-900 text-white shadow'
                                            : 'border-stone-200 bg-white/80 text-stone-600 hover:border-stone-400 hover:text-stone-900'
                                        }`}
                                      >
                                        {option.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-stone-700">
                                    Relationship
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {personaRelationshipOptions.map((option) => (
                                      <Button
                                        key={option.value}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPersonaRelationship(option.value)}
                                        className={`h-auto rounded-full border-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                                          personaRelationship === option.value
                                            ? 'border-stone-900 bg-stone-900 text-white shadow'
                                            : 'border-stone-200 bg-white/80 text-stone-600 hover:border-stone-400 hover:text-stone-900'
                                        }`}
                                      >
                                        {option.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                              <p className="text-sm font-semibold text-stone-700">
                                Tone preference
                              </p>
                              <div className="mt-3 grid gap-3 md:grid-cols-3">
                                {personaToneOptions.map((tone) => {
                                  const Icon = tone.icon
                                  const isActive = personaTones.includes(tone.value)
                                  return (
                                    <Button
                                      key={tone.value}
                                      type="button"
                                      variant="outline"
                                      onClick={() => togglePersonaTone(tone.value)}
                                      className={`h-auto items-start gap-2 rounded-2xl border-2 px-4 py-4 text-left text-sm font-semibold transition ${
                                        isActive
                                          ? 'border-stone-900 bg-stone-900 text-white shadow-lg'
                                          : 'border-stone-200 bg-white/80 text-stone-700 hover:border-stone-400 hover:text-stone-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 text-sm">
                                        <Icon className="h-4 w-4" />
                                        {tone.label}
                                      </div>
                                      <p className="text-xs font-normal opacity-80">
                                        {tone.description}
                                      </p>
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-stone-700">
                                Audience notes
                              </p>
                              <Textarea
                                value={personaNotes}
                                onChange={(event) => setPersonaNotes(event.target.value)}
                                placeholder="What keeps them up at night? What do they hope God will do?"
                                className="mt-3 min-h-[160px] rounded-2xl border-stone-300 bg-white/90"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div data-testid="section-prompt" className="relative hidden bg-white rounded-3xl shadow-xl ">
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
                          className={`relative shadow-none resize-none bg-transparent pr-12 pb-16 px-4 border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 text-base ${
                            animatingTextarea ? 'animate-text-appear' : ''
                          }`}
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          onPaste={handlePaste}
                          onKeyDown={(e) => {
                            if (
                              e.key === 'Enter' &&
                              (e.metaKey || e.ctrlKey) &&
                              textContent.trim()
                            ) {
                              e.preventDefault()
                              void handleSubmit()
                            }
                          }}
                        />

                        {/* Plus icon - bottom left */}
                        <div className="absolute bottom-3 left-3 context-menu-container">
                          <button
                            onClick={handleFileSelect}
                            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors group cursor-pointer"
                            title="More options"
                          >
                            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          </button>

                          {/* Context Menu */}
                          {showContextMenu && (
                            <div className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[200px] z-50">
                              <button
                                onClick={handlePhotosAndFiles}
                                className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors cursor-pointer"
                              >
                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                <span className="text-left">Add photos</span>
                              </button>
                              <button
                                onClick={handleLinkToSite}
                                className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors cursor-pointer"
                              >
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <span className="text-left">Link to site</span>
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Run button - bottom right */}
                        <button
                          onClick={handleSubmit}
                          disabled={!textContent.trim() || isProcessing}
                          className="absolute bottom-3 right-3 px-4 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary/90 transition-colors group cursor-pointer"
                        >
                          {isProcessing ? (
                            <span className="inline-flex items-center">
                              <span className="animate-pulse">R</span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.1s' }}
                              >
                                u
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.2s' }}
                              >
                                n
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.3s' }}
                              >
                                n
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.4s' }}
                              >
                                i
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.5s' }}
                              >
                                n
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.6s' }}
                              >
                                g
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.7s' }}
                              >
                                .
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.8s' }}
                              >
                                .
                              </span>
                              <span
                                className="animate-pulse"
                                style={{ animationDelay: '0.9s' }}
                              >
                                .
                              </span>
                            </span>
                          ) : (
                            <>Run&nbsp;&nbsp;&nbsp;&nbsp;⌘ + ↵</>
                          )}
                        </button>
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                                    checked as boolean
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
                      <div className="mt-12">
                        <label className="text-sm font-medium mb-2 block">
                          AI Enhanced Content
                        </label>
                        <div className="p-4 bg-muted/50 rounded-lg border">
                          <p className="text-sm whitespace-pre-wrap">
                            {aiResponse}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            This enhanced version is ready for social sharing.
                            You can use it as-is or edit it further.
                          </p>
                          {aiResponse && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <History className="w-3 h-3" />
                              <span>Conversation context preserved</span>
                            </div>
                          )}
                        </div>
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
                                        checked as boolean
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

                  <div className="mt-8 pt-6 border-t border-border">
                    <Button
                      size="lg"
                      className="w-full h-16 text-lg font-semibold flex items-center justify-center gap-2"
                      onClick={() => {
                        console.log('Selected outputs:', selectedOutputs)
                        // Dummy create functionality
                        alert('Create functionality - coming soon!')
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                      Create Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
