import { TFunction } from 'next-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import { BlockEventLabel } from '../../../../../../../../../../../__generated__/globalTypes'
import { eventLabelOptions } from '../eventLabels'

import { getCurrentEventLabel } from './getCurrentEventLabel'

describe('getCurrentEventLabel', () => {
  const t = jest.fn((key) => key) as unknown as TFunction

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the first event label option (None) by default', () => {
    const result = getCurrentEventLabel(t)
    expect(result).toEqual(eventLabelOptions(t)[0])
    expect(result.type).toBe('none')
  })

  it('should return the matching event label option when selectedBlock has eventLabel', () => {
    const cardBlock: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      eventLabel: BlockEventLabel.decisionForChrist,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }

    const result = getCurrentEventLabel(t, cardBlock)
    expect(result.type).toBe(BlockEventLabel.decisionForChrist)
    expect(result.label).toBe('Decision for Christ')
  })

  it('should use eventLabel when videoActionType is start', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      eventLabel: BlockEventLabel.specialVideoStart,
      endEventLabel: null,
      muted: true,
      autoplay: true,
      startAt: 0,
      endAt: null,
      posterBlockId: null,
      fullsize: true,
      videoId: null,
      videoVariantLanguageId: null,
      source: null as unknown as any,
      title: null,
      description: null,
      image: null,
      duration: null,
      objectFit: null,
      showGeneratedSubtitles: null,
      subtitleLanguage: null,
      mediaVideo: null,
      action: null,
      customizable: null,
      children: []
    }

    const result = getCurrentEventLabel(t, videoBlock, 'start')
    expect(result.type).toBe(BlockEventLabel.specialVideoStart)
    expect(result.label).toBe('Video Started')
  })

  it('should return eventLabel for ButtonBlock when set', () => {
    const buttonBlock: TreeBlock<ButtonBlock> = {
      id: 'button1.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      eventLabel: BlockEventLabel.custom1,
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

    const result = getCurrentEventLabel(t, buttonBlock)
    expect(result.type).toBe(BlockEventLabel.custom1)
    expect(result.label).toBe('Custom Tracking 1')
  })
})
