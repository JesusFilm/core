import type { TreeBlock } from '@core/journeys/ui/block'
import {
  SetSelectedStepAction,
  SetSelectedBlockByIdAction
} from '@core/journeys/ui/EditorProvider'
import {
  TypographyVariant,
  TypographyAlign,
  TypographyColor
} from '../../../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../__generated__/GetJourney'
import getSelected, { GetSelectedProps } from './getSelected'

describe('updatedSelected', () => {
  const selectedBlock: TreeBlock<TypographyBlock> = {
    id: 'typography0.id',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    content: 'Title',
    variant: TypographyVariant.h1,
    color: TypographyColor.primary,
    align: TypographyAlign.center,
    children: []
  }
  const block1: TreeBlock<TypographyBlock> = {
    ...selectedBlock,
    id: 'typography1.id',
    parentOrder: 1
  }
  const block2: TreeBlock<TypographyBlock> = {
    ...selectedBlock,
    id: 'typography2.id',
    parentOrder: 2
  }

  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journeyId',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [selectedBlock, block1, block2]
      }
    ]
  }

  const step1: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step1.id',
    parentBlockId: 'journeyId',
    parentOrder: 1,
    locked: true,
    nextBlockId: 'step2.id',
    children: []
  }

  const step2: TreeBlock<StepBlock> = {
    ...step1,
    id: 'step2.id',
    parentOrder: 2,
    nextBlockId: 'stepId'
  }

  const steps: Array<TreeBlock<StepBlock>> = [selectedStep, step1, step2]

  it('should select the block before deleted block by default', () => {
    const input: GetSelectedProps = {
      parentOrder: 1,
      siblings: selectedStep.children[0].children,
      type: 'TypographyBlock',
      steps
    }
    const expected: SetSelectedBlockByIdAction = {
      type: 'SetSelectedBlockByIdAction',
      id: 'typography0.id'
    }
    expect(getSelected(input)).toEqual(expected)
  })

  it('should select the block after deleted block if its the first block', () => {
    const input: GetSelectedProps = {
      parentOrder: 0,
      siblings: selectedStep.children[0].children,
      type: 'TypographyBlock',
      steps
    }
    const expected: SetSelectedBlockByIdAction = {
      type: 'SetSelectedBlockByIdAction',
      id: 'typography0.id'
    }
    expect(getSelected(input)).toEqual(expected)
  })

  it('should select the parent block when all children blocks deleted', () => {
    const input = {
      parentOrder: 0,
      siblings: [],
      type: 'TypographyBlock',
      steps,
      selectedStep
    }
    const expected: SetSelectedStepAction = {
      type: 'SetSelectedStepAction',
      step: selectedStep
    }
    expect(getSelected(input)).toEqual(expected)
  })

  it('should select the step before the deleted step by deafult', () => {
    const input = {
      parentOrder: 2,
      siblings: [],
      type: 'StepBlock',
      steps,
      selectedStep: step2
    }
    const expected: SetSelectedStepAction = {
      type: 'SetSelectedStepAction',
      step: step1
    }
    expect(getSelected(input)).toEqual(expected)
  })

  it('should select the step after the deleted step if deleted step is the first step', () => {
    const input = {
      parentOrder: 1,
      siblings: [step1, step2],
      type: 'StepBlock',
      steps,
      selectedStep: selectedStep
    }
    const expected: SetSelectedStepAction = {
      type: 'SetSelectedStepAction',
      step: step1
    }
    expect(getSelected(input)).toEqual(expected)
  })

  it('should return null when last card is deleted', () => {
    const input = {
      parentOrder: 0,
      siblings: [],
      type: 'StepBlock',
      steps: [selectedStep],
      selectedStep
    }
    expect(getSelected(input)).toEqual(null)
  })
})
