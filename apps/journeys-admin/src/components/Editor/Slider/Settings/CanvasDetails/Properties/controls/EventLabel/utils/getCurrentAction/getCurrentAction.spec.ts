import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import { metaActions } from '../metaActions'

import { getCurrentAction } from './getCurrentAction'

describe('getCurrentAction', () => {
  it('should return the first metaAction (None) by default', () => {
    const result = getCurrentAction()
    expect(result).toEqual(metaActions[0])
    expect(result.type).toBe('none')
  })

  it('should return the first metaAction when selectedBlock is provided', () => {
    const cardBlock: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }

    const result = getCurrentAction(cardBlock)
    expect(result).toEqual(metaActions[0])
  })

  it('should return the first metaAction when videoActionType is start', () => {
    const videoBlock = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getCurrentAction(videoBlock, 'start')
    expect(result).toEqual(metaActions[0])
  })

  it('should return the first metaAction when videoActionType is complete', () => {
    const buttonBlock: TreeBlock<ButtonBlock> = {
      id: 'button1.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: false,
      action: null,
      settings: null,
      children: []
    }

    const result = getCurrentAction(buttonBlock, 'complete')
    expect(result).toEqual(metaActions[0])
  })
})
