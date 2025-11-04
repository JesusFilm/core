import { TypographyVariant } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import {
  ButtonFields_action_LinkAction as LinkAction,
  ButtonFields_action_NavigateToBlockAction as NavigateToBlockAction
} from '../../__generated__/ButtonFields'

import { getActionLabel } from './getActionLabel'

describe('getActionLabel', () => {
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
        slug: null,
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
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
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
        slug: null,
        children: []
      }
    ]
    const t = (str: string): string => str

    const result = getActionLabel(action, treeBlocks, t)
    expect(result).toBe('Unknown Step')
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
