import { memo } from 'react'

import { Card, CardContent } from '../../components/ui/card'
import type { GeneratedStepContent } from '../../libs/storage'

import { deriveHeadingFromContent } from './polotnoDesign'
import { StepContentRenderer } from './StepContentRenderer'
import { useIntersectionObserver } from './useIntersectionObserver'

type StepHandlers = Record<
  number,
  { onContentChange: (value: string) => void; onFocus: () => void }
>

type StepsListProps = {
  editableSteps: GeneratedStepContent[]
  editingStepIndices: Set<number>
  stepHandlers: StepHandlers
  copiedStepIndex: number | null
  onCopyStep: (content: string, index: number) => void | Promise<void>
  onEditingComplete: (stepIndex: number) => void
  loadImagesWhenVisible: (step: GeneratedStepContent, index: number) => void
}

export const StepsList = memo(({
  editableSteps,
  editingStepIndices,
  stepHandlers,
  copiedStepIndex,
  onCopyStep,
  onEditingComplete,
  loadImagesWhenVisible
}: StepsListProps) => {
  return (
    <>
      {editableSteps.map((step, index) => {
        const heading = deriveHeadingFromContent(step.content, `Step ${index + 1}`)
        const cardKey = heading ? `${heading}-${index}` : `step-${index}`

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
                    onCopy={(stepIndex, content) =>
                      onCopyStep(content, stepIndex)
                    }
                    onEditingComplete={onEditingComplete}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </>
  )
})

StepsList.displayName = 'StepsList'
