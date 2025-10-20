import Image from 'next/image'
import type { FC } from 'react'

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
          {selectedImageForDetails !== null && (() => {
            const analysis = imageAnalysisResults[selectedImageForDetails]

            return (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-64 h-64 rounded-lg overflow-hidden bg-muted border">
                    {analysis?.imageSrc ? (
                      <Image
                        src={analysis.imageSrc}
                        alt={`Image ${selectedImageForDetails + 1}`}
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
                </div>

                {analysis?.isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Analyzing image...</span>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">Content Type:</span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          analysis.contentType === 'bible_picture'
                            ? 'bg-blue-100 text-blue-800'
                            : analysis.contentType === 'devotional_picture'
                              ? 'bg-green-100 text-green-800'
                              : analysis.contentType === 'church_service_slide'
                                ? 'bg-purple-100 text-purple-800'
                                : analysis.contentType === 'scripture_verse'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {analysis.contentType
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())}
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

                    {analysis.extractedText && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Extracted Text:</h4>
                        <div className="p-3 bg-muted rounded-lg border">
                          <p className="text-sm font-mono whitespace-pre-wrap">
                            {analysis.extractedText}
                          </p>
                        </div>
                      </div>
                    )}

                    {Array.isArray(analysis.contentIdeas) && analysis.contentIdeas.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Content Ideas:</h4>
                        <div className="space-y-2">
                          {analysis.contentIdeas.map((idea, ideaIndex) => (
                            <div
                              key={ideaIndex}
                              className="text-xs px-3 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
                            >
                              {typeof idea === 'string' ? idea : JSON.stringify(idea)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

      <Dialog open={showAllIdeas} onOpenChange={onShowAllIdeasChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Content Ideas for {contentTypeLabel}</DialogTitle>
            <DialogDescription>
              Click any idea below to add it to your content. These ideas are tailored to your uploaded images.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {imageAnalysisResults
              .filter(
                (result) =>
                  result.contentIdeas && result.contentIdeas.length > 0 && !result.isAnalyzing
              )
              .map((analysis, analysisIndex) => (
                <div key={analysisIndex} className="space-y-3">
                  {analysisIndex > 0 && <hr className="border-border" />}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.isArray(analysis.contentIdeas) &&
                      analysis.contentIdeas.map((idea, ideaIndex) => {
                        const suggestionKey = `modal-${analysisIndex}-${ideaIndex}`
                        if (hiddenSuggestions.has(suggestionKey)) return null

                        return (
                          <div
                            key={ideaIndex}
                            className={`relative p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white hover:scale-102 transition-all duration-200 ${
                              animatingSuggestion?.analysisIndex === analysisIndex &&
                              animatingSuggestion?.ideaIndex === ideaIndex
                                ? 'animate-suggestion-disappear opacity-100'
                                : 'opacity-0 animate-fade-in-up transition-all duration-300'
                            }`}
                            style={{
                              animationDelay: `${
                                0.4 + (analysisIndex * analysis.contentIdeas.length + ideaIndex) * 0.1
                              }s`,
                              animationFillMode: 'forwards'
                            }}
                            onClick={() => onSuggestionSelected(suggestionKey)}
                          >
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {typeof idea === 'string' ? idea : JSON.stringify(idea)}
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
    </>
  )
}
