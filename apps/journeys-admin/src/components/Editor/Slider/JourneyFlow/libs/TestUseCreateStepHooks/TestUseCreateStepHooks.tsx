import { ReactElement } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { ActionBlock } from '@core/journeys/ui/isActionBlock'
import { CommandRedoItem } from '../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../Toolbar/Items/CommandUndoItem'
import { useCreateStep } from '../useCreateStep'
import { useCreateStepFromAction } from '../useCreateStepFromAction'
import { useCreateStepFromButton } from '../useCreateStepFromButton'
import { useCreateStepFromSocialPreview } from '../useCreateStepFromSocialPreview'

interface TestUseCreateStepHooksProps {
  sourceStep?: TreeBlock<StepBlock>
  sourceBlock?: ActionBlock
  selectedStep?: TreeBlock<StepBlock>
  steps?: TreeBlock<StepBlock>[]
}
function UseCreateStepComponent({
  sourceStep,
  sourceBlock
}: TestUseCreateStepHooksProps): ReactElement {
  const createStep = useCreateStep()
  const createStepFromAction = useCreateStepFromAction()
  const createStepFromSocialPreview = useCreateStepFromSocialPreview()
  const createStepFromButton = useCreateStepFromButton()

  async function handleCreateStepClick() {
    if (sourceStep == null) return
    await createStep({
      x: 777,
      y: 777,
      sourceStep: sourceStep
    })
  }

  async function handleCreateStepFromActionClick() {
    if (sourceStep == null && sourceBlock == null) return
    await createStepFromAction({
      x: 777,
      y: 777,
      sourceStep: sourceStep,
      sourceBlock: sourceBlock
    })
  }

  async function handleCreateStepFromSocialPreviewClick() {
    await createStepFromSocialPreview({
      x: 777,
      y: 777
    })
  }

  async function handleCreateStepFromButtonClick() {
    await createStepFromButton({
      x: -200,
      y: 38
    })
  }

  return (
    <>
      <div data-testId="useCreateStep" onClick={handleCreateStepClick} />
      <div
        data-testId="useCreateStepFromAction"
        onClick={handleCreateStepFromActionClick}
      />
      <div
        data-testId="useCreateStepFromSocialPreview"
        onClick={handleCreateStepFromSocialPreviewClick}
      />
      <div
        data-testId="useCreateStepFromButton"
        onClick={handleCreateStepFromButtonClick}
      />
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
        <UseCreateStepComponent
          sourceStep={sourceStep}
          sourceBlock={sourceBlock}
        />
      </EditorProvider>
    </JourneyProvider>
  )
}
