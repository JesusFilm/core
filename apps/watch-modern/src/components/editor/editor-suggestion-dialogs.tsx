import Image from 'next/image'
import type { FC } from 'react'

import { cn } from "@core/shared/uimodern/utils"
import type { ImageAnalysisResult } from '../../libs/storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'

interface EditorSuggestionDialogsProps {
  imageAnalysisResults: ImageAnalysisResult[]
  selectedImageForDetails: number | null
  onCloseDetails: () => void
  showAllIdeas: boolean
  onShowAllIdeasChange: (open: boolean) => void
  hiddenSuggestions: Set<string>
  onSuggestionSelected: (suggestionKey: string) => void
  animatingSuggestion: { analysisIndex: number; ideaIndex: number } | null
  contentTypeLabel: string
}

export const EditorSuggestionDialogs: FC<EditorSuggestionDialogsProps> = ({
  imageAnalysisResults,
  selectedImageForDetails,
  onCloseDetails,
  showAllIdeas,
  onShowAllIdeasChange,
  hiddenSuggestions,
  onSuggestionSelected,
  animatingSuggestion,
  contentTypeLabel
}) => {
  const handleDetailsDialogChange = (open: boolean) => {
    if (!open) {
      onCloseDetails()
    }
  }

  const selectedAnalysis =
    selectedImageForDetails !== null
      ? imageAnalysisResults[selectedImageForDetails]
      : undefined

  const analysesWithIdeas = imageAnalysisResults.filter(
    (result) =>
      Array.isArray(result.contentIdeas) &&
      result.contentIdeas.length > 0 &&
      !result.isAnalyzing
  )

  return (
    <>
      <Dialog open={selectedImageForDetails !== null} onOpenChange={handleDetailsDialogChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Image Analysis Details</DialogTitle>
            <DialogDescription>
              Detailed analysis of the selected image by AI
            </DialogDescription>
          </DialogHeader>
          <SelectedAnalysisContent
            analysis={selectedAnalysis}
            selectedIndex={selectedImageForDetails}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAllIdeas} onOpenChange={onShowAllIdeasChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Content Ideas for {contentTypeLabel}</DialogTitle>
            <DialogDescription>
              Click any idea below to add it to your content. These ideas are tailored to your uploaded images.
            </DialogDescription>
          </DialogHeader>
          <AllContentIdeas
            analyses={analysesWithIdeas}
            hiddenSuggestions={hiddenSuggestions}
            onSuggestionSelected={onSuggestionSelected}
            animatingSuggestion={animatingSuggestion}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

interface SelectedAnalysisContentProps {
  analysis?: ImageAnalysisResult
  selectedIndex: number | null
}

const SelectedAnalysisContent: FC<SelectedAnalysisContentProps> = ({
  analysis,
  selectedIndex
}) => {
  if (selectedIndex === null) return null

  if (!analysis) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>
          No analysis available. Try again once the AI proxy finishes processing, or re-run the
          analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <AnalysisImagePreview imageSrc={analysis.imageSrc} index={selectedIndex} />
      </div>
      {analysis.isAnalyzing ? (
        <AnalyzingState />
      ) : (
        <div className="space-y-4">
          <AnalysisMeta
            contentType={analysis.contentType}
            confidence={analysis.confidence}
          />
          <ExtractedTextSection text={analysis.extractedText} />
          <ContentIdeasSection ideas={analysis.contentIdeas} />
          <DetailedDescriptionSection description={analysis.detailedDescription} />
        </div>
      )}
    </div>
  )
}

const AnalyzingState = () => (
  <div className="flex items-center justify-center gap-2 py-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    <span className="text-sm font-medium text-muted-foreground">Analyzing image...</span>
  </div>
)

interface AnalysisImagePreviewProps {
  imageSrc?: string
  index: number
}

const AnalysisImagePreview: FC<AnalysisImagePreviewProps> = ({ imageSrc, index }) => (
  <div className="w-64 h-64 rounded-lg overflow-hidden bg-muted border">
    {imageSrc ? (
      <Image
        src={imageSrc}
        alt={`Image ${index + 1}`}
        width={256}
        height={256}
        className="h-full w-full object-cover"
        unoptimized
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
        No image available
      </div>
    )}
  </div>
)

interface AnalysisMetaProps {
  contentType?: string
  confidence?: string
}

const AnalysisMeta: FC<AnalysisMetaProps> = ({ contentType, confidence }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm font-medium">Content Type:</span>
    {contentType && <ContentTypeBadge type={contentType} />}
    {confidence && <ConfidenceBadge confidence={confidence} />}
  </div>
)

interface ContentIdeasSectionProps {
  ideas?: string[]
}

const ContentIdeasSection: FC<ContentIdeasSectionProps> = ({ ideas }) => {
  if (!Array.isArray(ideas) || ideas.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Content Ideas:</h4>
      <div className="space-y-2">
        {ideas.map((idea, ideaIndex) => (
          <div
            key={ideaIndex}
            className="text-xs px-3 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
          >
            {typeof idea === 'string' ? idea : JSON.stringify(idea)}
          </div>
        ))}
      </div>
    </div>
  )
}

interface ExtractedTextSectionProps {
  text?: string
}

const ExtractedTextSection: FC<ExtractedTextSectionProps> = ({ text }) => {
  if (!text) return null

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Extracted Text:</h4>
      <div className="p-3 bg-muted rounded-lg border">
        <p className="text-sm font-mono whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

interface DetailedDescriptionSectionProps {
  description?: string
}

const DetailedDescriptionSection: FC<DetailedDescriptionSectionProps> = ({ description }) => {
  if (!description) return null

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Detailed Description:</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

interface AllContentIdeasProps {
  analyses: ImageAnalysisResult[]
  hiddenSuggestions: Set<string>
  onSuggestionSelected: (suggestionKey: string) => void
  animatingSuggestion: { analysisIndex: number; ideaIndex: number } | null
}

const AllContentIdeas: FC<AllContentIdeasProps> = ({
  analyses,
  hiddenSuggestions,
  onSuggestionSelected,
  animatingSuggestion
}) => {
  if (analyses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No content ideas are available yet. Try running image analysis to generate suggestions.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {analyses.map((analysis, analysisIndex) => (
        <div key={analysisIndex} className="space-y-3">
          {analysisIndex > 0 && <hr className="border-border" />}
          <AllIdeasHeader analysis={analysis} analysisIndex={analysisIndex} />
          <AllIdeasGrid
            analysis={analysis}
            analysisIndex={analysisIndex}
            hiddenSuggestions={hiddenSuggestions}
            onSuggestionSelected={onSuggestionSelected}
            animatingSuggestion={animatingSuggestion}
          />
        </div>
      ))}
    </div>
  )
}

interface AllIdeasHeaderProps {
  analysis: ImageAnalysisResult
  analysisIndex: number
}

const AllIdeasHeader: FC<AllIdeasHeaderProps> = ({ analysis, analysisIndex }) => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border flex-shrink-0">
      {analysis.imageSrc ? (
        <Image
          src={analysis.imageSrc}
          alt={`Image ${analysisIndex + 1}`}
          width={32}
          height={32}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
          N/A
        </div>
      )}
    </div>
    <span className="text-sm font-medium text-muted-foreground">
      Ideas from Image {analysisIndex + 1}
    </span>
  </div>
)

interface AllIdeasGridProps {
  analysis: ImageAnalysisResult
  analysisIndex: number
  hiddenSuggestions: Set<string>
  onSuggestionSelected: (suggestionKey: string) => void
  animatingSuggestion: { analysisIndex: number; ideaIndex: number } | null
}

const AllIdeasGrid: FC<AllIdeasGridProps> = ({
  analysis,
  analysisIndex,
  hiddenSuggestions,
  onSuggestionSelected,
  animatingSuggestion
}) => {
  const suggestions = Array.isArray(analysis.contentIdeas) ? analysis.contentIdeas : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {suggestions.map((idea, ideaIndex) => {
        const suggestionKey = createSuggestionKey('modal', analysisIndex, ideaIndex)
        if (hiddenSuggestions.has(suggestionKey)) return null

        const isAnimating =
          animatingSuggestion?.analysisIndex === analysisIndex &&
          animatingSuggestion?.ideaIndex === ideaIndex

        return (
          <button
            key={ideaIndex}
            type="button"
            className={cn(
              'relative p-4 border border-gray-200 rounded-lg text-left transition-all duration-200 hover:bg-white hover:scale-102 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer',
              isAnimating
                ? 'animate-suggestion-disappear opacity-100'
                : 'opacity-0 animate-fade-in-up'
            )}
            style={{
              animationDelay: `${0.4 + (analysisIndex * suggestions.length + ideaIndex) * 0.1}s`,
              animationFillMode: 'forwards'
            }}
            onClick={() => onSuggestionSelected(suggestionKey)}
          >
            <p className="text-sm text-gray-800 leading-relaxed">
              {typeof idea === 'string' ? idea : JSON.stringify(idea)}
            </p>
          </button>
        )
      })}
    </div>
  )
}

interface ContentTypeBadgeProps {
  type: string
}

const ContentTypeBadge: FC<ContentTypeBadgeProps> = ({ type }) => {
  const formattedType = type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

  return (
    <span className={cn('text-xs px-3 py-1 rounded-full', getContentTypeClassName(type))}>
      {formattedType}
    </span>
  )
}

const getContentTypeClassName = (type: string) => {
  switch (type) {
    case 'bible_picture':
      return 'bg-blue-100 text-blue-800'
    case 'devotional_picture':
      return 'bg-green-100 text-green-800'
    case 'church_service_slide':
      return 'bg-purple-100 text-purple-800'
    case 'scripture_verse':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface ConfidenceBadgeProps {
  confidence: string
}

const ConfidenceBadge: FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const normalized = confidence.toLowerCase()

  const className =
    normalized === 'high'
      ? 'bg-green-100 text-green-800'
      : normalized === 'medium'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-primary/10 text-primary'

  return (
    <span className={cn('text-xs px-3 py-1 rounded-full', className)}>
      {confidence} confidence
    </span>
  )
}

const createSuggestionKey = (prefix: string, analysisIndex: number, ideaIndex: number) =>
  `${prefix}-${analysisIndex}-${ideaIndex}`
