import { memo, useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import { Card, CardContent } from '../ui/card'
import { StepContentRenderer } from './StepContentRenderer'
import type { StepContentRendererProps } from './StepContentRenderer'

import type { GeneratedStepContent } from '../../libs/storage'

type IntersectionObserverOptions = IntersectionObserverInit | undefined

const useIntersectionObserver = (
  callback: () => void,
  options?: IntersectionObserverOptions
) => {
  const [element, setElement] = useState<Element | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (!element || hasTriggered) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }
        callback()
        setHasTriggered(true)
        observer.disconnect()
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [callback, element, hasTriggered, options])

  return { ref: setElement }
}

export type StepHandlerMap = Record<
  number,
  {
    onContentChange: (value: string) => void
    onFocus: () => void
  }
>

export type StepsListProps = {
  editableSteps: GeneratedStepContent[]
  editingStepIndices: Set<number>
  stepHandlers: StepHandlerMap
  copiedStepIndex: number | null
  deriveHeadingFromContent: (content: string, fallback: string) => string
  loadImagesWhenVisible: (step: GeneratedStepContent, stepIndex: number) => void
  unsplashImages: Record<string, string[]>
  onImageSelection: (stepIndex: number, imageUrl: string) => void
  onCopyStep: StepContentRendererProps['onCopyStep']
  onEditingComplete: (stepIndex: number) => void
}

const StepsListComponent = ({
  editableSteps,
  editingStepIndices,
  stepHandlers,
  copiedStepIndex,
  deriveHeadingFromContent,
  loadImagesWhenVisible,
  unsplashImages: _unsplashImages,
  onImageSelection: _onImageSelection,
  onCopyStep,
  onEditingComplete
}: StepsListProps): ReactElement => {
  return (
    <>
      {editableSteps.map((step, index) => {
        const heading = deriveHeadingFromContent(
          step.content,
          `Step ${index + 1}`
        )
        const cardKey = heading ? `${heading}-${index}` : `step-${index}`

        const { ref: cardRef } = useIntersectionObserver(
          () => loadImagesWhenVisible(step, index),
          { threshold: 0.1 }
        )

        const handler = stepHandlers[index]

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
                    onContentChange={handler?.onContentChange ?? (() => {})}
                    onFocus={handler?.onFocus ?? (() => {})}
                    copiedStepIndex={copiedStepIndex}
                    onCopyStep={onCopyStep}
                    onEditingComplete={onEditingComplete}
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
}

export const StepsList = memo(StepsListComponent)
