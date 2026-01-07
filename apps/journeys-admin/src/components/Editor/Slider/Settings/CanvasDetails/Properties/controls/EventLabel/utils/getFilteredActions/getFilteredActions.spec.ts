import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import { eventLabelOptions } from '../eventLabels'

import { getFilteredEventLabels } from './getFilteredActions'

describe('getFilteredEventLabels', () => {
  it('should return all event label options when selectedBlock is null', () => {
    const result = getFilteredEventLabels(undefined)
    expect(result).toEqual(eventLabelOptions)
  })

  it('should return filtered event labels for CardBlock', () => {
    const cardBlock = {
      __typename: 'CardBlock',
      children: []
    } as unknown as TreeBlock<CardBlock>

    const result = getFilteredEventLabels(cardBlock)

    const expectedTypes = [
      'none',
      'decisionForChrist',
      'gospelPresentationStart',
      'gospelPresentationComplete',
      'custom1',
      'custom2',
      'custom3'
    ]

    expect(result.map((option) => option.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return filtered event labels for regular ButtonBlock', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      submitEnabled: false,
      children: []
    } as unknown as TreeBlock<ButtonBlock>

    const result = getFilteredEventLabels(buttonBlock)

    const expectedTypes = [
      'none',
      'prayerRequest',
      'decisionForChrist',
      'gospelPresentationStart',
      'gospelPresentationComplete',
      'custom1',
      'custom2',
      'custom3'
    ]

    expect(result.map((option) => option.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return filtered event labels for submit ButtonBlock', () => {
    const submitButtonBlock = {
      __typename: 'ButtonBlock',
      submitEnabled: true,
      children: []
    } as unknown as TreeBlock<ButtonBlock>

    const result = getFilteredEventLabels(submitButtonBlock)

    const expectedTypes = [
      'none',
      'prayerRequest',
      'decisionForChrist',
      'rsvp',
      'custom1',
      'custom2',
      'custom3'
    ]

    expect(result.map((option) => option.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return filtered event labels for RadioOptionBlock', () => {
    const radioOptionBlock = {
      __typename: 'RadioOptionBlock',
      children: []
    } as unknown as TreeBlock<RadioOptionBlock>

    const result = getFilteredEventLabels(radioOptionBlock)

    const expectedTypes = [
      'none',
      'prayerRequest',
      'decisionForChrist',
      'gospelPresentationStart',
      'gospelPresentationComplete',
      'custom1',
      'custom2',
      'custom3'
    ]

    expect(result.map((option) => option.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return all event label options when videoActionType is null', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getFilteredEventLabels(videoBlock)
    expect(result).toEqual(eventLabelOptions)
  })

  it('should return filtered event labels for VideoBlock with start action type', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getFilteredEventLabels(videoBlock, 'start')

    const expectedTypes = [
      'none',
      'prayerRequest',
      'decisionForChrist',
      'gospelPresentationStart',
      'specialVideoStart',
      'custom1',
      'custom2',
      'custom3'
    ]

    expect(result.map((option) => option.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return filtered event labels for VideoBlock with complete action type', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getFilteredEventLabels(videoBlock, 'complete')

    const expectedTypes = [
      'none',
      'prayerRequest',
      'decisionForChrist',
      'gospelPresentationComplete',
      'specialVideoComplete',
      'custom1',
      'custom2',
      'custom3'
    ]

    expect(result.map((option) => option.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return all event label options for unknown block types', () => {
    const unknownBlock = {
      __typename: 'UnknownBlock',
      children: []
    } as unknown as TreeBlock

    const result = getFilteredEventLabels(unknownBlock)
    expect(result).toEqual(eventLabelOptions)
  })
})
