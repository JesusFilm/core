import { TFunction } from 'next-i18next'

import { BlockEventLabel } from '../../../../../../../../../../../__generated__/globalTypes'
import { eventLabelOptions } from '../eventLabels'

import { getEventLabelOption } from './getEventLabelOption'

describe('getEventLabelOption', () => {
  const t = jest.fn((key) => key) as unknown as TFunction

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the option when value matches an event label type', () => {
    const result = getEventLabelOption(t, BlockEventLabel.decisionForChrist)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.decisionForChrist
      )
    )
    expect(result.type).toBe('decisionForChrist')
    expect(result.label).toBe('Decision for Christ')
  })

  it('should return the first event label option (None) when value does not match any type', () => {
    const result = getEventLabelOption(
      t,
      'unknownEventLabelType' as unknown as BlockEventLabel
    )
    expect(result).toEqual(eventLabelOptions(t)[0])
    expect(result.type).toBe('none')
  })

  it('should return the option for prayerRequest', () => {
    const result = getEventLabelOption(t, BlockEventLabel.prayerRequest)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.prayerRequest
      )
    )
    expect(result.type).toBe('prayerRequest')
    expect(result.label).toBe('Prayer Request')
  })

  it('should return the option for gospelPresentationStart', () => {
    const result = getEventLabelOption(
      t,
      BlockEventLabel.gospelPresentationStart
    )
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.gospelPresentationStart
      )
    )
    expect(result.type).toBe('gospelPresentationStart')
    expect(result.label).toBe('Gospel Presentation Started')
  })

  it('should return the option for gospelPresentationComplete', () => {
    const result = getEventLabelOption(
      t,
      BlockEventLabel.gospelPresentationComplete
    )
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.gospelPresentationComplete
      )
    )
    expect(result.type).toBe('gospelPresentationComplete')
    expect(result.label).toBe('Gospel Presentation Completed')
  })

  it('should return the option for rsvp', () => {
    const result = getEventLabelOption(t, BlockEventLabel.rsvp)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.rsvp
      )
    )
    expect(result.type).toBe('rsvp')
    expect(result.label).toBe('RSVP')
  })

  it('should return the option for specialVideoStart', () => {
    const result = getEventLabelOption(t, BlockEventLabel.specialVideoStart)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.specialVideoStart
      )
    )
    expect(result.type).toBe('specialVideoStart')
    expect(result.label).toBe('Video Started')
  })

  it('should return the option for specialVideoComplete', () => {
    const result = getEventLabelOption(t, BlockEventLabel.specialVideoComplete)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.specialVideoComplete
      )
    )
    expect(result.type).toBe('specialVideoComplete')
    expect(result.label).toBe('Video Completed')
  })

  it('should return the option for custom1', () => {
    const result = getEventLabelOption(t, BlockEventLabel.custom1)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.custom1
      )
    )
    expect(result.type).toBe('custom1')
    expect(result.label).toBe('Custom Tracking 1')
  })

  it('should return the option for custom2', () => {
    const result = getEventLabelOption(t, BlockEventLabel.custom2)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.custom2
      )
    )
    expect(result.type).toBe('custom2')
    expect(result.label).toBe('Custom Tracking 2')
  })

  it('should return the option for custom3', () => {
    const result = getEventLabelOption(t, BlockEventLabel.custom3)
    expect(result).toEqual(
      eventLabelOptions(t).find(
        (option) => option.type === BlockEventLabel.custom3
      )
    )
    expect(result.type).toBe('custom3')
    expect(result.label).toBe('Custom Tracking 3')
  })

  it('should return the first event label option (None) for empty string', () => {
    const result = getEventLabelOption(t, '' as unknown as BlockEventLabel)
    expect(result).toEqual(eventLabelOptions(t)[0])
    expect(result.type).toBe('none')
  })
})
