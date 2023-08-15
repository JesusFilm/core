import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import {
  ButtonFields_action_LinkAction as LinkAction,
  ButtonFields_action_NavigateAction as NavigateAction,
  ButtonFields_action_NavigateToBlockAction as NavigateToBlockAction,
  ButtonFields_action_NavigateToJourneyAction as NavigateToJourneyAction
} from '../../__generated__/ButtonFields'

import { getActionLabel } from './getActionLabel'

describe('getActionLabel', () => {
  it('should be undefined for NavigateAction', () => {
    const action: NavigateAction = {
      __typename: 'NavigateAction',
      parentBlockId: 'parentBlock.id',
      gtmEventName: 'click'
    }
    const result = getActionLabel(action)
    expect(result).toBeUndefined()
  })

  it('should return step block title for NavigateToBlockAction', () => {
    const action: NavigateToBlockAction = {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'parentBlock.id',
      gtmEventName: 'click',
      blockId: 'step.id'
    }
    const treeBlocks: TreeBlock[] = [
      {
        __typename: 'StepBlock',
        id: 'step.id',
        parentBlockId: null,
        parentOrder: null,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'TypographyBlock',
            id: 'typography0.id',
            parentBlockId: 'card.id',
            parentOrder: 1,
            align: null,
            color: null,
            variant: TypographyVariant.h2,
            content: 'Step Heading',
            children: []
          }
        ]
      }
    ]
    const t = (str: string): string => str

    const result = getActionLabel(action, treeBlocks, t)
    expect(result).toBe('Step Heading')
  })

  it('should return Unknown Step for NavigateToBlockAction if stepId is invalid', () => {
    const action: NavigateToBlockAction = {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'parentBlock.id',
      gtmEventName: 'click',
      blockId: 'step.id'
    }
    const treeBlocks: TreeBlock[] = [
      {
        __typename: 'StepBlock',
        id: 'anotherStep.id',
        parentBlockId: null,
        parentOrder: null,
        locked: false,
        nextBlockId: null,
        children: []
      }
    ]
    const t = (str: string): string => str

    const result = getActionLabel(action, treeBlocks, t)
    expect(result).toBe('Unknown Step')
  })

  it('should return journey slug for NavigateToJourneyAction', () => {
    const action: NavigateToJourneyAction = {
      __typename: 'NavigateToJourneyAction',
      parentBlockId: 'parentBlock.id',
      gtmEventName: 'click',
      journey: {
        __typename: 'Journey',
        id: 'journey.id',
        slug: 'journey-slug',
        language: {
          __typename: 'Language',
          bcp47: 'language.id'
        }
      }
    }

    const result = getActionLabel(action)
    expect(result).toEqual(action.journey?.slug)
  })

  it('should return Unknown Journey for NavigateToJourneyAction if journey is null', () => {
    const action: NavigateToJourneyAction = {
      __typename: 'NavigateToJourneyAction',
      parentBlockId: 'parentBlock.id',
      gtmEventName: 'click',
      journey: null
    }

    const result = getActionLabel(action)
    expect(result).toBe('Unknown Journey')
  })

  it('should return url for LinkAction', () => {
    const action: LinkAction = {
      __typename: 'LinkAction',
      parentBlockId: 'parentBlock.id',
      gtmEventName: 'click',
      url: 'https://test.com/some-address'
    }

    const result = getActionLabel(action)
    expect(result).toEqual(action.url)
  })
})
