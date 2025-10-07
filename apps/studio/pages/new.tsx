import {
  ArrowUp,
  Crown,
  Facebook,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  Info,
  Instagram,
  X,
  Palette,
  Paperclip,
  Plus,
  Printer,
  Settings,
  Sparkles,
  Twitter,
  Users,
  Video,
  Youtube,
  Zap
} from 'lucide-react'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'

import { Accordion } from '../src/components/ui/accordion'
import { Button } from '../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card'
import { Checkbox } from '../src/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../src/components/ui/dialog'
import { Input } from '../src/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs'
import { Textarea } from '../src/components/ui/textarea'
import { type UserInputData, userInputStorage } from '../src/libs/storage'

const steps = [
  { id: 1, title: 'Content', description: 'What do you want to share?' },
  { id: 2, title: 'Style', description: 'Choose your design style' },
  { id: 3, title: 'Output', description: 'Select output formats' }
]

// Removed - now using proper conversation history instead of RAG

const IMAGE_ANALYSIS_PROMPT = `You are an expert at analyzing religious and spiritual content images for Jesus Film Project. Analyze this image and provide a detailed response in the following JSON format:

{
  "contentType": "One of: devotional_picture, bible_picture, church_service_slide, scripture_verse, worship_image, religious_artwork, nature_spiritual, community_event, ministry_activity, other",
  "extractedText": "Any text visible in the image - perform OCR and extract all readable text exactly as it appears",
  "bibleCharacters": "If there are identifiable people who appear to be biblical characters, list them with confidence levels. Format: 'character_name (confidence%)'. If no biblical characters, return empty array.",
  "detailedDescription": "If there's no text, provide a detailed description of the image including: composition, colors, mood, setting, any people/objects/symbols, artistic style, and spiritual/religious elements",
  "confidence": "Overall confidence in the analysis (high/medium/low)"
}

Content type definitions:
- devotional_picture: Images designed for daily devotionals, quiet time, spiritual reflection
- bible_picture: Illustrations or photos depicting bible stories, characters, or scenes
- church_service_slide: PowerPoint slides or presentation slides used in church services
- scripture_verse: Images containing bible verses, often with decorative backgrounds
- worship_image: Images related to worship, praise, music ministry
- religious_artwork: Paintings, drawings, or artistic representations with religious themes
- nature_spiritual: Nature scenes used for spiritual purposes or contemplation
- community_event: Photos of church events, gatherings, fellowship activities
- ministry_activity: Images showing ministry work, outreach, service projects
- other: Any other type of religious/spiritual content not covered above

Be thorough and accurate in your analysis.`

export default function NewPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOutputs, setSelectedOutputs] = useState<Record<string, string[]>>({})
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageAttachments, setImageAttachments] = useState<string[]>([])
  const [imageAnalysisResults, setImageAnalysisResults] = useState<Array<{
    imageSrc: string
    contentType: string
    extractedText: string
    bibleCharacters: string[]
    detailedDescription: string
    confidence: string
    isAnalyzing: boolean
  }>>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [savedSessions, setSavedSessions] = useState<UserInputData[]>([])
  const [totalTokensUsed, setTotalTokensUsed] = useState({ input: 0, output: 0 })
  const [isTokensUpdated, setIsTokensUpdated] = useState(false)
  const [selectedImageForDetails, setSelectedImageForDetails] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showContextMenu && !(event.target as Element).closest('.context-menu-container')) {
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
      setImageAnalysisResults(draft.imageAnalysisResults.map(result => ({
        ...result,
        isAnalyzing: false
      })))
    }
  }, [])

  // Load OpenAI API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = localStorage.getItem('jesus-film-studio-openai-api-key')
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
          imageAnalysisResults: imageAnalysisResults.map(result => ({
            imageSrc: result.imageSrc,
            contentType: result.contentType,
            extractedText: result.extractedText,
            bibleCharacters: result.bibleCharacters,
            detailedDescription: result.detailedDescription,
            confidence: result.confidence,
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

  const handleOutputChange = (category: string, optionName: string, checked: boolean) => {
    setSelectedOutputs(prev => {
      const categoryOutputs = prev[category] || []
      if (checked) {
        return { ...prev, [category]: [...categoryOutputs, optionName] }
      } else {
        return { ...prev, [category]: categoryOutputs.filter(o => o !== optionName) }
      }
    })
  }

// Removed - using proper conversation history instead

  const buildConversationHistory = (): Array<{role: 'system' | 'user' | 'assistant', content: string}> => {
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = []

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
        if (analysis.bibleCharacters && analysis.bibleCharacters.length > 0) {
          imageContext += `  Characters: ${analysis.bibleCharacters.join(', ')}\n`
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

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          messages: messages,
        //   max_completion_tokens: 2000,
        //   temperature: 0.9,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process content')
      }

      const data = await response.json()
      const processedContent = data.choices[0]?.message?.content || 'No response generated'
      setAiResponse(processedContent)

      // Track token usage
      if (data.usage) {
        setTotalTokensUsed(prev => ({
          input: prev.input + (data.usage.prompt_tokens || 0),
          output: prev.output + (data.usage.completion_tokens || 0)
        }))
      }
    } catch (error) {
      console.error('Error processing content:', error)
      // Restore previous response if API call failed
      setAiResponse(previousResponse)
      alert('Failed to process content. Please check your API key and try again.')
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
    setImageAnalysisResults(prev => {
      const updated = [...prev]
      if (!updated[imageIndex]) {
        updated[imageIndex] = {
          imageSrc,
          contentType: '',
          extractedText: '',
          bibleCharacters: [],
          detailedDescription: '',
          confidence: '',
          isAnalyzing: true
        }
      } else {
        updated[imageIndex].isAnalyzing = true
      }
      return updated
    })

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
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
          temperature: 0.1, // Low temperature for more consistent analysis
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const data = await response.json()
      let analysisText = data.choices[0]?.message?.content || '{}'

      // Track token usage
      if (data.usage) {
        setTotalTokensUsed(prev => ({
          input: prev.input + (data.usage.prompt_tokens || 0),
          output: prev.output + (data.usage.completion_tokens || 0)
        }))
      }

      // Extract JSON from markdown code block if present
      if (analysisText.includes('```json') || analysisText.includes('```')) {
        const jsonMatch = analysisText.match(/```\s*(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          analysisText = jsonMatch[1].trim()
        }
      }

      // Parse the JSON response
      let analysisResult
      try {
        analysisResult = JSON.parse(analysisText)
      } catch (parseError) {
        console.error('Failed to parse analysis response:', parseError)
        console.error('Raw response:', data.choices[0]?.message?.content)
        analysisResult = {
          contentType: 'other',
          extractedText: '',
          bibleCharacters: [],
          detailedDescription: 'Failed to analyze image',
          confidence: 'low'
        }
      }

      // Update the analysis results
      setImageAnalysisResults(prev => {
        const updated = [...prev]
        updated[imageIndex] = {
          imageSrc,
          contentType: analysisResult.contentType || 'other',
          extractedText: analysisResult.extractedText || '',
          bibleCharacters: Array.isArray(analysisResult.bibleCharacters) ? analysisResult.bibleCharacters : [],
          detailedDescription: analysisResult.detailedDescription || '',
          confidence: analysisResult.confidence || 'low',
          isAnalyzing: false
        }
        return updated
      })

    } catch (error) {
      console.error('Error analyzing image:', error)
      setImageAnalysisResults(prev => {
        const updated = [...prev]
        updated[imageIndex] = {
          imageSrc,
          contentType: 'error',
          extractedText: '',
          bibleCharacters: [],
          detailedDescription: 'Failed to analyze image. Please check your API key.',
          confidence: 'low',
          isAnalyzing: false
        }
        return updated
      })
    }
  }

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) return

    imageFiles.forEach((file, fileIndex) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Please use images smaller than 10MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          const currentIndex = imageAttachments.length + fileIndex
          setImageAttachments(prev => [...prev, result])
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
    setImageAttachments(prev => prev.filter((_, i) => i !== index))
    setImageAnalysisResults(prev => prev.filter((_, i) => i !== index))
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

  const loadSession = (session: UserInputData) => {
    setTextContent(session.textContent)
    setImageAttachments(session.images)
    setAiResponse(session.aiResponse || '')
    setImageAnalysisResults(session.imageAnalysisResults.map(result => ({
      ...result,
      isAnalyzing: false
    })))

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
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                    isTokensUpdated ? 'bg-red-500 text-white' : 'bg-muted'
                  }`}>
                    <span className={isTokensUpdated ? 'text-white' : 'text-muted-foreground'}>Tokens:</span>
                    <span className="font-medium">
                      {(() => {
                        const total = totalTokensUsed.input + totalTokensUsed.output
                        if (total >= 1000000) {
                          return `${(total / 1000000).toFixed(1)}M`
                        } else if (total >= 1000) {
                          return `${(total / 1000).toFixed(1)}K`
                        }
                        return total.toLocaleString()
                      })()}
                    </span>
                    <span className={isTokensUpdated ? 'text-white' : 'text-muted-foreground'}>•</span>
                    <span className="font-medium">
                      ${Math.max((((totalTokensUsed.input / 1000000) * 0.05) + ((totalTokensUsed.output / 1000000) * 0.40)), 0.01).toFixed(2)}
                    </span>
                  </div>
                )}
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-3 cursor-pointer hover:!bg-transparent group">
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
                        <label htmlFor="openai-api-key" className="text-sm font-medium">
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
                          Your API key is required to process content with OpenAI. It will be stored locally in your browser.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* AI Analysis Details Dialog */}
                <Dialog open={selectedImageForDetails !== null} onOpenChange={() => setSelectedImageForDetails(null)}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>AI Image Analysis Details</DialogTitle>
                      <DialogDescription>
                        Detailed analysis of the selected image by AI
                      </DialogDescription>
                    </DialogHeader>
                    {selectedImageForDetails !== null && (() => {
                      const analysis = imageAnalysisResults[selectedImageForDetails]
                      const imageSrc = imageAttachments[selectedImageForDetails]
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
                                <span className="text-sm font-medium">Content Type:</span>
                                <span className={`text-xs px-3 py-1 rounded-full ${
                                  analysis.contentType === 'bible_picture' ? 'bg-blue-100 text-blue-800' :
                                  analysis.contentType === 'devotional_picture' ? 'bg-green-100 text-green-800' :
                                  analysis.contentType === 'church_service_slide' ? 'bg-purple-100 text-purple-800' :
                                  analysis.contentType === 'scripture_verse' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {analysis.contentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full ml-2 ${
                                  analysis.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                  analysis.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-primary/10 text-primary'
                                }`}>
                                  {analysis.confidence} confidence
                                </span>
                              </div>

                              {/* Extracted text */}
                              {analysis.extractedText && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Extracted Text:</h4>
                                  <div className="p-3 bg-muted rounded-lg border">
                                    <p className="text-sm font-mono whitespace-pre-wrap">{analysis.extractedText}</p>
                                  </div>
                                </div>
                              )}

                              {/* Bible characters */}
                              {analysis.bibleCharacters.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Identified Bible Characters:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.bibleCharacters.map((character, charIndex) => (
                                      <span key={charIndex} className="text-xs px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                                        {character}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Detailed description */}
                              {analysis.detailedDescription && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Detailed Description:</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {analysis.detailedDescription}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No analysis available. Please configure your OpenAI API key in settings to enable image analysis.</p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Stepper */}
        <div className="border-b border-border bg-stone-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      step.id <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white text-muted-foreground shadow-sm'
                    }`}>
                      {step.id}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        step.id === currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-px mx-4 ${
                        step.id < currentStep ? 'bg-primary' : 'bg-muted'
                      }`} />
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

        <main
          className="container mx-auto px-4 py-8 relative"
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
            <div className="max-w-4xl mx-auto">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">What do you want to share?</CardTitle>
                  <p className="text-muted-foreground">Drop here your idea or picture of your content</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative bg-white rounded-3xl shadow-xl ">
                    {/* <label className="text-sm font-medium mb-2 block">Text Content</label> */}
                    <div className="relative">
                      {/* Image Attachments Carousel - inside textarea */}
                      {imageAttachments.length > 0 && (
                        <div className=" top-4 left-4 right-4 z-10">
                          <div className="flex gap-2 overflow-x-auto p-4">
                            {imageAttachments.map((imageSrc, index) => {
                              const analysis = imageAnalysisResults[index]
                              return (
                                <div key={index} className="relative group flex-shrink-0">
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
                                      onClick={() => setSelectedImageForDetails(index)}
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
                        className={`relative shadow-none resize-none bg-transparent pr-12 pb-16 px-4 border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 overflow-hidden pt-4 text-base`}
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        onPaste={handlePaste}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && textContent.trim()) {
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


                  {aiResponse && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">AI Enhanced Content</label>
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          This enhanced version is ready for social sharing. You can use it as-is or edit it further.
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Browse Images</label>
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
          )}

          {/* Step 2: Style */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Style</CardTitle>
                  <p className="text-muted-foreground">Choose your design style</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {styleOptions.map((style) => {
                      const IconComponent = style.icon
                      return (
                        <Button key={style.name} variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                          <IconComponent className="w-6 h-6" />
                          <span className="text-sm">{style.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">(Select one or more styles for your content)</p>
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
                  <p className="text-muted-foreground">Select the formats you want to generate</p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="video" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="video" className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="social" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Social
                      </TabsTrigger>
                      <TabsTrigger value="print" className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                      </TabsTrigger>
                      <TabsTrigger value="web" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Web
                      </TabsTrigger>
                    </TabsList>

                    {Object.entries(outputOptions).map(([category, options]) => (
                      <TabsContent key={category} value={category} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {options.map((option) => {
                            const IconComponent = option.icon
                            return (
                              <div key={option.name} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                  id={`${category}-${option.name}`}
                                  checked={(selectedOutputs[category] || []).includes(option.name)}
                                  onCheckedChange={(checked) =>
                                    handleOutputChange(category, option.name, checked as boolean)
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
                    ))}
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

          {/* Previous Requests Accordion */}
          <div className="max-w-4xl mx-auto mt-12 mb-8">
            <Accordion
              title="Previous Tasks"
              defaultOpen={false}
              className="border-muted"
              icon={<History className="w-4 h-4 text-muted-foreground" />}
            >
              <div className="space-y-3">
                {savedSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 text-sm">
                    No saved requests yet. Your past ideas will appear here.
                  </p>
                ) : (
                  savedSessions.map((session) => (
                    <Card key={session.id} className="p-3 border-muted">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {session.textContent.substring(0, 60)}...
                            </h4>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>{new Date(session.timestamp).toLocaleString()}</p>
                            <p>{session.images.length} images • {session.aiResponse ? 'Has AI response' : 'No AI response'}</p>
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
                  ))
                )}
              </div>
            </Accordion>
          </div>
        </main>
      </div>
    </>
  )
}
