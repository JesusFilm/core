import { eventLabelOptions } from '../eventLabels'

import { getEventLabelOption } from './getNewAction'

describe('getEventLabelOption', () => {
  it('should return the option when value matches an event label type', () => {
    const result = getEventLabelOption('decisionForChrist')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'decisionForChrist')
    )
    expect(result.type).toBe('decisionForChrist')
    expect(result.label).toBe('Decision for Christ')
  })

  it('should return the first event label option (None) when value does not match any type', () => {
    const result = getEventLabelOption('unknownEventLabelType')
    expect(result).toEqual(eventLabelOptions[0])
    expect(result.type).toBe('none')
  })

  it('should return the option for prayerRequest', () => {
    const result = getEventLabelOption('prayerRequest')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'prayerRequest')
    )
    expect(result.type).toBe('prayerRequest')
    expect(result.label).toBe('Prayer Request')
  })

  it('should return the option for gospelPresentationStart', () => {
    const result = getEventLabelOption('gospelPresentationStart')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'gospelPresentationStart')
    )
    expect(result.type).toBe('gospelPresentationStart')
    expect(result.label).toBe('Gospel Presentation Started')
  })

  it('should return the option for gospelPresentationComplete', () => {
    const result = getEventLabelOption('gospelPresentationComplete')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'gospelPresentationComplete')
    )
    expect(result.type).toBe('gospelPresentationComplete')
    expect(result.label).toBe('Gospel Presentation Completed')
  })

  it('should return the option for rsvp', () => {
    const result = getEventLabelOption('rsvp')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'rsvp')
    )
    expect(result.type).toBe('rsvp')
    expect(result.label).toBe('RSVP')
  })

  it('should return the option for specialVideoStart', () => {
    const result = getEventLabelOption('specialVideoStart')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'specialVideoStart')
    )
    expect(result.type).toBe('specialVideoStart')
    expect(result.label).toBe('Video Started')
  })

  it('should return the option for specialVideoComplete', () => {
    const result = getEventLabelOption('specialVideoComplete')
    expect(result).toEqual(
      eventLabelOptions.find(
        (option) => option.type === 'specialVideoComplete'
      )
    )
    expect(result.type).toBe('specialVideoComplete')
    expect(result.label).toBe('Video Completed')
  })

  it('should return the option for custom1', () => {
    const result = getEventLabelOption('custom1')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'custom1')
    )
    expect(result.type).toBe('custom1')
    expect(result.label).toBe('Custom Event 1')
  })

  it('should return the option for custom2', () => {
    const result = getEventLabelOption('custom2')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'custom2')
    )
    expect(result.type).toBe('custom2')
    expect(result.label).toBe('Custom Event 2')
  })

  it('should return the option for custom3', () => {
    const result = getEventLabelOption('custom3')
    expect(result).toEqual(
      eventLabelOptions.find((option) => option.type === 'custom3')
    )
    expect(result.type).toBe('custom3')
    expect(result.label).toBe('Custom Event 3')
  })

  it('should return the first event label option (None) for empty string', () => {
    const result = getEventLabelOption('')
    expect(result).toEqual(eventLabelOptions[0])
    expect(result.type).toBe('none')
  })
})
