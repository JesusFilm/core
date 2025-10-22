import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { IMAGE_ANALYSIS_PROMPT, contextDetailOptions, steps } from '../../config/new-page'
import { useAiContent } from '../../hooks/useAiContent'
import { useImageAnalysis } from '../../hooks/useImageAnalysis'
import { useNewPageSession } from '../../hooks/useNewPageSession'
import { useUnsplashMedia } from '../../hooks/useUnsplashMedia'
import {
  type GeneratedStepContent,
  type ImageAnalysisResult,
  type UserInputData,
  userInputStorage
} from '../../libs/storage'

import { buildConversationHistory } from './conversation'
import {
  createPolotnoDesignFromContent,
  deriveBodyFromContent,
  deriveHeadingFromContent
} from './polotnoDesign'
import type { SelectedOutputsMap } from './polotnoDesign'
import {
  normalizeGeneratedSteps,
  parseGeneratedSteps
} from './stepProcessing'

type AiOutputContent = {
  type?: string | null
  text?: string | null
}

type AiResponseChunk = {
  content?: AiOutputContent[] | null
}

type AiResponsePayload = {
  output_text?: string | null
  output?: AiResponseChunk[] | null
}

type TokenUsage = {
  input_tokens?: number | null
  output_tokens?: number | null
} | null | undefined

export function useNewPageController() {
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
  const [aiError, setAiError] = useState<{
    message: string
    isNetworkError: boolean
  } | null>(null)
  const [editableSteps, setEditableSteps] = useState<GeneratedStepContent[]>([])
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

  const conversationHistoryBuilder = useCallback(
    () =>
      buildConversationHistory({
        selectedContext,
        imageAnalysisResults,
        textContent,
        aiResponse
      }),
    [selectedContext, imageAnalysisResults, textContent, aiResponse]
  )

  // Removed - using proper conversation history instead

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

    const extractTextFromResponse = (
      result: AiResponsePayload | null | undefined
    ): string => {
      if (!result) {
        return ''
      }

      if (typeof result.output_text === 'string' && result.output_text.trim().length > 0) {
        return result.output_text
      }

      if (Array.isArray(result.output)) {
        for (const item of result.output) {
          const content = item?.content ?? []
          if (Array.isArray(content)) {
            const textPart = content.find(
              (part): part is { type: 'output_text'; text: string } =>
                part?.type === 'output_text' && typeof part?.text === 'string'
            )
            if (textPart?.text?.trim()) {
              return textPart.text
            }
          }
        }
      }

      return ''
    }

    const accumulateUsage = (usage: TokenUsage) => {
      if (!usage) return

      const newTokens = {
        input: usage.input_tokens ?? 0,
        output: usage.output_tokens ?? 0
    }

    updateTokens(currentSessionId, newTokens)
  }

  const handleAiError = useCallback(
    (_error: unknown, { isNetworkError }: { isNetworkError: boolean }) => {
      setAiError({
        isNetworkError,
        message: isNetworkError
          ? 'We had trouble reaching the Studio AI service. Check your connection and try again.'
          : 'Something went wrong while generating content. Please try again.'
      })
    },
    [setAiError]
  )

  const { processContentWithAI } = useAiContent({
    textareaRef,
    aiResponse,
    editableSteps,
    imageAttachments,
    imageAnalysisResults,
    buildConversationHistory: conversationHistoryBuilder,
    extractTextFromResponse,
    parseGeneratedSteps,
    setEditableSteps,
    setIsProcessing,
    saveSession,
    updateTokens,
    onError: handleAiError
  })

  const { analyzeImageWithAI } = useImageAnalysis({
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
      if (typeof window !== 'undefined') {
        const globalWindow = window as Window & {
          testUnsplashAPI?: typeof testUnsplashAPI
        }
        globalWindow.testUnsplashAPI = testUnsplashAPI
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
    if (currentValue.trim() && !isProcessing) {
      setAiError(null)
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

  return {
    aiError,
    aiResponse,
    animatingSuggestion,
    animatingTextarea,
    cameraInputRef,
    collapsedTiles,
    copiedStepIndex,
    currentStep,
    deleteSession,
    editableSteps,
    editingStepIndices,
    fileInputRef,
    getContentTypeForHeader,
    handleCameraChange,
    handleCategoryChange,
    handleContextChange,
    handleCopyStep,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    handleGenerateDesign,
    handleImageSelection,
    handleNext,
    handleOpenCamera,
    handleOutputChange,
    handlePaste,
    handlePersonaFieldChange,
    handlePersonaSubmit,
    handlePrevious,
    removeImage,
    handleSubmit,
    hasPendingImageAnalysis,
    hiddenSuggestions,
    highlightedCategory,
    hidingSuggestionsCarousel,
    hoveredCategory,
    shouldShowHoverEffect,
    imageAnalysisResults,
    imageAttachments,
    isAnimationStopped,
    isCollapsing,
    isContextContainerHidden,
    isDragOver,
    isGeneratingDesign,
    isHovering,
    isPersonaDialogOpen,
    isProcessing,
    isSessionsOpen,
    isSettingsOpen,
    isTilesContainerHovered,
    isTokensUpdated,
    loadImagesWhenVisible,
    loadSession,
    loadingSession,
    personaSettings,
    parsedContentHeadingSuffix,
    savedSessions,
    selectedContext,
    selectedContextDetail,
    selectedContextOptions,
    selectedDetailOption,
    selectedImageForDetails,
    selectedOutputs,
    setAiError,
    setAnimatingSuggestion,
    setAnimatingTextarea,
    setHiddenSuggestions,
    setHoveredCategory,
    setIsHovering,
    setIsPersonaDialogOpen,
    setIsTilesContainerHovered,
    setIsSessionsOpen,
    setIsSettingsOpen,
    setSelectedContextDetail,
    setSelectedImageForDetails,
    setShowAllIdeas,
    setShowTestimonialBackground,
    setTextContent,
    setUnsplashApiKey,
    showAllIdeas,
    showTestimonialBackground,
    stepHandlers,
    steps,
    textContent,
    textareaRef,
    totalTokensUsed,
    unsplashApiKey,
    unsplashImages,
    testUnsplashAPI
  }
}

export type NewPageController = ReturnType<typeof useNewPageController>
