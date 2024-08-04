import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { ActionBlock } from '@core/journeys/ui/isActionBlock'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { CommandRedoItem } from '../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../Toolbar/Items/CommandUndoItem'
import { useCreateStep } from '../useCreateStep'
import { useCreateStepFromAction } from '../useCreateStepFromAction'
import { useCreateStepFromSocialPreview } from '../useCreateStepFromSocialPreview'
import { useCreateStepFromStep } from '../useCreateStepFromStep'

interface TestUseCreateStepHooksProps {
  sourceStep?: TreeBlock<StepBlock>
  sourceBlock?: ActionBlock
  selectedStep?: TreeBlock<StepBlock>
  steps?: Array<TreeBlock<StepBlock>>
}
function CreateStepComponent({
  sourceStep,
  sourceBlock
}: TestUseCreateStepHooksProps): ReactElement {
  const createStepFromStep = useCreateStepFromStep()
  const createStepFromAction = useCreateStepFromAction()
  const createStepFromSocialPreview = useCreateStepFromSocialPreview()
  const createStep = useCreateStep()

  async function handleCreateStepFromStepClick(): Promise<void> {
    if (sourceStep == null) return
    await createStepFromStep({
      x: 777,
      y: 777,
      sourceStep
    })
  }

  async function handleCreateStepFromActionClick(): Promise<void> {
    if (sourceStep == null || sourceBlock == null) return
    await createStepFromAction({
      x: 777,
      y: 777,
      sourceStep,
      sourceBlock
    })
  }

  async function handleCreateStepFromSocialPreviewClick(): Promise<void> {
    await createStepFromSocialPreview({
      x: 777,
      y: 777
    })
  }

  async function handleCreateStepClick(): Promise<void> {
    await createStep({
      x: -200,
      y: 38
    })
  }

  return (
    <>
      <div
        data-testId="useCreateStepFromStep"
        onClick={handleCreateStepFromStepClick}
      />
      <div
        data-testId="useCreateStepFromAction"
        onClick={handleCreateStepFromActionClick}
      />
      <div
        data-testId="useCreateStepFromSocialPreview"
        onClick={handleCreateStepFromSocialPreviewClick}
      />
      <div data-testId="useCreateStep" onClick={handleCreateStepClick} />
    </>
  )
}

export function TestUseCreateStepHooks({
  sourceStep,
  sourceBlock,
  selectedStep,
  steps
}: TestUseCreateStepHooksProps): ReactElement {
  return (
    <JourneyProvider value={{ journey: defaultJourney }}>
      <EditorProvider initialState={{ selectedStep, steps }}>
        <CommandUndoItem variant="button" />
        <CommandRedoItem variant="button" />
        <CreateStepComponent
          sourceStep={sourceStep}
          sourceBlock={sourceBlock}
        />
      </EditorProvider>
    </JourneyProvider>
  )
}
