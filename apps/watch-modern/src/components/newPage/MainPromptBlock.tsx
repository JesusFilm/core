import { Camera, Info, Users, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import type {
  ChangeEvent,
  ClipboardEvent,
  Dispatch,
  FormEventHandler,
  ReactElement,
  RefObject,
  SetStateAction
} from 'react'

import { AutoResizeTextarea, Textarea } from '@core/shared/uimodern/components/textarea'
import type { ImageAnalysisResult } from '../../libs/storage'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Input } from '../ui/input'

const AnimatedLoadingText = dynamic(
  async () => {
    const mod = await import(
      /* webpackChunkName: "studio-main-prompt-animated-loading-text" */ './AnimatedLoadingText'
    )
    return mod.AnimatedLoadingText
  },
  { ssr: false }
)

type PersonaSettings = {
  personaName: string
  audienceDescription: string
  tone: string
  goals: string
}

type MainPromptBlockProps = {
  selectedContext: string
  imageAttachments: string[]
  imageAnalysisResults: ImageAnalysisResult[]
  removeImage: (index: number) => void
  setSelectedImageForDetails: Dispatch<SetStateAction<number | null>>
  textareaRef: RefObject<HTMLTextAreaElement | null>
  animatingTextarea: boolean
  handlePaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void
  setTextContent: Dispatch<SetStateAction<string>>
  handleSubmit: () => void | Promise<void>
  isProcessing: boolean
  hasPendingImageAnalysis: boolean
  handleOpenCamera: () => void
  isPersonaDialogOpen: boolean
  setIsPersonaDialogOpen: Dispatch<SetStateAction<boolean>>
  aiResponse: string
  personaSettings: PersonaSettings
  handlePersonaFieldChange: (
    field: keyof PersonaSettings
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handlePersonaSubmit: FormEventHandler<HTMLFormElement>
}

export function MainPromptBlock({
  selectedContext,
  imageAttachments,
  imageAnalysisResults,
  removeImage,
  setSelectedImageForDetails,
  textareaRef,
  animatingTextarea,
  handlePaste,
  setTextContent,
  handleSubmit,
  isProcessing,
  hasPendingImageAnalysis,
  handleOpenCamera,
  isPersonaDialogOpen,
  setIsPersonaDialogOpen,
  aiResponse,
  personaSettings,
  handlePersonaFieldChange,
  handlePersonaSubmit
}: MainPromptBlockProps): ReactElement {
  return (
    <div
      data-testid="section-prompt"
      data-id="PromptBlock"
      className={`relative ${selectedContext ? '' : 'hidden'} bg-white rounded-3xl shadow-xl `}
      suppressHydrationWarning
    >
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

        <AutoResizeTextarea
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
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-transparent text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
            title="Add image"
            type="button"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">Add Image</span>
          </button>
        </div>

        {/* Action buttons - bottom right */}
        <Dialog open={isPersonaDialogOpen} onOpenChange={setIsPersonaDialogOpen}>
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-transparent text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
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
              className="px-4 py-2 text-sm font-medium text-white rounded-full bg-primary hover:bg-primary/90 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/90 cursor-pointer"
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
                <>Analyzing…</>
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
  )
}
