import { TreeBlock } from '@core/journeys/ui'
import {
  TypographyVariant,
  TypographyAlign,
  TypographyColor
} from '../../../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../__generated__/GetJourney'
import { getSelected } from './getSelected'

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
  it('should select the next child block', () => {
    const input = {
      parentOrder: 1,
      siblings: selectedStep.children[0].children,
      type: 'TypographyBlock',
      steps
    }
    expect(getSelected(input)).toEqual({
      type: 'SetSelectedBlockByIdAction',
      id: 'typography1.id'
    })
  })
  it('should select the new last block when last block deleted', () => {
    const input = {
      parentOrder: 2,
      siblings: selectedStep.children[0].children,
      type: 'TypographyBlock',
      steps
    }
    expect(getSelected(input)).toEqual({
      type: 'SetSelectedBlockByIdAction',
      id: 'typography2.id'
    })
  })
  it('should select the parent block when all children blocks deleted', () => {
    const input = {
      parentOrder: 0,
      siblings: [],
      type: 'TypographyBlock',
      steps,
      toDeleteStep: selectedStep
    }
    expect(getSelected(input)).toEqual({
      type: 'SetSelectedStepAction',
      step: selectedStep
    })
  })
  it('should select the previous linked step when entire step deleted', () => {
    const input = {
      parentOrder: 2,
      siblings: [],
      type: 'StepBlock',
      steps,
      toDeleteStep: step2
    }
    expect(getSelected(input)).toEqual({
      type: 'SetSelectedStepAction',
      step: step1
    })
  })
  it('should select the last step when an unlinked step is deleted', () => {
    const input = {
      parentOrder: 1,
      siblings: [],
      type: 'StepBlock',
      steps,
      toDeleteStep: step1
    }
    expect(getSelected(input)).toEqual({
      type: 'SetSelectedStepAction',
      step: step2
    })
  })

  it('should return null when last card is deleted', () => {
    const input = {
      parentOrder: 0,
      siblings: [],
      type: 'StepBlock',
      steps: [],
      toDeleteStep: selectedStep
    }
    expect(getSelected(input)).toEqual(null)
  })
})
