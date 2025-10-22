import {
  ArrowUp,
  Bot,
  Camera,
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
  MessageSquare,
  Plus,
  Printer,
  Settings,
  Sparkles,
  Users,
  Video,
  X,
  Youtube
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import { PrayerCarousel } from '../../components/PrayerCarousel'
import { Accordion } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../../components/ui/carousel'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../components/ui/tabs'
import { Textarea } from '../../components/ui/textarea'

import { outputOptions, styleOptions } from './constants'
import { RotatingText } from './RotatingText'
import { SavedSessionsPanel } from './SavedSessionsPanel'
import { StepsList } from './StepsList'
import type { NewPageController } from './useNewPageController'

const AnimatedLoadingText = dynamic(
  () =>
    import(
      /* webpackChunkName: "studio-new-page-animated-loading-text" */
      './AnimatedLoadingText'
    ).then((mod) => mod.AnimatedLoadingText),
  { ssr: false }
)

const FormatSelection = dynamic(
  () =>
    import(
      /* webpackChunkName: "studio-new-page-format-selection" */ './FormatSelection'
    ).then((mod) => mod.FormatSelection),
  { ssr: false }
)

type NewPageLayoutProps = {
  controller: NewPageController
}

export function NewPageLayout({ controller }: NewPageLayoutProps) {
  const {
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
    testUnsplashAPI
  } = controller

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

        <SavedSessionsPanel
          isOpen={isSessionsOpen}
          isCollapsing={isCollapsing}
          savedSessions={savedSessions}
          loadingSession={loadingSession}
          onLoadSession={loadSession}
          onDeleteSession={deleteSession}
        />

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
                              className="px-4 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary/90 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/90"
                              type="button"
                              disabled={isProcessing || hasPendingImageAnalysis}
                              title={
                                hasPendingImageAnalysis
                                  ? 'Please wait for the attached images to finish analysis before running the AI prompt.'
                                  : 'Run the AI prompt'
                              }
                            >
                              {isProcessing ? (
                                <AnimatedLoadingText />
                              ) : hasPendingImageAnalysis ? (
                                <>Analyzing images…</>
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
                    {aiError && (
                      <div
                        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100"
                        role="status"
                        aria-live="polite"
                      >
                        <span>{aiError.message}</span>
                        {aiError.isNetworkError && (
                          <Button
                            variant="outline"
                            size="sm"
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
                    
                {isProcessing && (
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
                                onCopyStep={handleCopyStep}
                                onEditingComplete={(stepIndex) =>
                                  setEditingStepIndices((prev) => {
                                    const next = new Set(prev)
                                    next.delete(stepIndex)
                                    return next
                                  })
                                }
                                loadImagesWhenVisible={loadImagesWhenVisible}
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
