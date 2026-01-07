import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import { metaActions } from '../metaActions'

import { getFilteredActions } from './getFilteredActions'

describe('getFilteredActions', () => {
  it('should return all metaActions when selectedBlock is null', () => {
    const result = getFilteredActions(undefined)
    expect(result).toEqual(metaActions)
  })

  it('should return filtered actions for CardBlock', () => {
    const cardBlock = {
      __typename: 'CardBlock',
      children: []
    } as unknown as TreeBlock<CardBlock>

    const result = getFilteredActions(cardBlock)

    const expectedTypes = [
      'none',
      'christDecisionCapture',
      'gospelStartCapture',
      'gospelCompleteCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    expect(result.map((action) => action.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return filtered actions for regular ButtonBlock', () => {
    const buttonBlock = {
      __typename: 'ButtonBlock',
      submitEnabled: false,
      children: []
    } as unknown as TreeBlock<ButtonBlock>

    const result = getFilteredActions(buttonBlock)

    const expectedTypes = [
      'none',
      'prayerRequestCapture',
      'christDecisionCapture',
      'gospelStartCapture',
      'gospelCompleteCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    expect(result.map((action) => action.type)).toEqual(expectedTypes)
    expect(result.length).toBe(8)
  })

  it('should return filtered actions for submit ButtonBlock', () => {
    const submitButtonBlock = {
      __typename: 'ButtonBlock',
      submitEnabled: true,
      children: []
    } as unknown as TreeBlock<ButtonBlock>

    const result = getFilteredActions(submitButtonBlock)

    const expectedTypes = [
      'none',
      'prayerRequestCapture',
      'christDecisionCapture',
      'rsvpCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    expect(result.map((action) => action.type)).toEqual(expectedTypes)
    expect(result.length).toBe(7)
  })

  it('should return filtered actions for RadioOptionBlock', () => {
    const radioOptionBlock = {
      __typename: 'RadioOptionBlock',
      children: []
    } as unknown as TreeBlock<RadioOptionBlock>

    const result = getFilteredActions(radioOptionBlock)

    const expectedTypes = [
      'none',
      'prayerRequestCapture',
      'christDecisionCapture',
      'gospelStartCapture',
      'gospelCompleteCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    expect(result.map((action) => action.type)).toEqual(expectedTypes)
    expect(result.length).toBe(8)
  })

  it('should return all metaActions when videoActionType is null', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getFilteredActions(videoBlock)
    expect(result).toEqual(metaActions)
  })

  it('should return filtered actions for VideoBlock with start action type', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getFilteredActions(videoBlock, 'start')

    const expectedTypes = [
      'none',
      'prayerRequestCapture',
      'christDecisionCapture',
      'gospelStartCapture',
      'specialVideoStartCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    expect(result.map((action) => action.type)).toEqual(expectedTypes)
    expect(result.length).toBe(8)
  })

  it('should return filtered actions for VideoBlock with complete action type', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<VideoBlock>

    const result = getFilteredActions(videoBlock, 'complete')

    const expectedTypes = [
      'none',
      'prayerRequestCapture',
      'christDecisionCapture',
      'gospelCompleteCapture',
      'specialVideoCompleteCapture',
      'custom1Capture',
      'custom2Capture',
      'custom3Capture'
    ]

    expect(result.map((action) => action.type)).toEqual(expectedTypes)
    expect(result.length).toBe(8)
  })

  it('should return all metaActions for unknown block types', () => {
    const unknownBlock = {
      __typename: 'UnknownBlock',
      children: []
    } as unknown as TreeBlock

    const result = getFilteredActions(unknownBlock)
    expect(result).toEqual(metaActions)
  })
})
