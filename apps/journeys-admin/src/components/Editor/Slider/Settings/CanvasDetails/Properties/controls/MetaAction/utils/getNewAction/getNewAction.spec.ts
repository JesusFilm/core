import { metaActions } from '../metaActions'

import { getNewAction } from './getNewAction'

describe('getNewAction', () => {
  it('should return the action when value matches an action type', () => {
    const result = getNewAction('christDecisionCapture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'christDecisionCapture')
    )
    expect(result.type).toBe('christDecisionCapture')
    expect(result.label).toBe('Decision for Christ')
  })

  it('should return the first metaAction (None) when value does not match any action type', () => {
    const result = getNewAction('unknownActionType')
    expect(result).toEqual(metaActions[0])
    expect(result.type).toBe('none')
  })

  it('should return the action for prayerRequestCapture', () => {
    const result = getNewAction('prayerRequestCapture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'prayerRequestCapture')
    )
    expect(result.type).toBe('prayerRequestCapture')
    expect(result.label).toBe('Prayer Request')
  })

  it('should return the action for gospelStartCapture', () => {
    const result = getNewAction('gospelStartCapture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'gospelStartCapture')
    )
    expect(result.type).toBe('gospelStartCapture')
    expect(result.label).toBe('Gospel Presentation Started')
  })

  it('should return the action for gospelCompleteCapture', () => {
    const result = getNewAction('gospelCompleteCapture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'gospelCompleteCapture')
    )
    expect(result.type).toBe('gospelCompleteCapture')
    expect(result.label).toBe('Gospel Presentation Completed')
  })

  it('should return the action for rsvpCapture', () => {
    const result = getNewAction('rsvpCapture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'rsvpCapture')
    )
    expect(result.type).toBe('rsvpCapture')
    expect(result.label).toBe('RSVP')
  })

  it('should return the action for specialVideoStartCapture', () => {
    const result = getNewAction('specialVideoStartCapture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'specialVideoStartCapture')
    )
    expect(result.type).toBe('specialVideoStartCapture')
    expect(result.label).toBe('Video Started')
  })

  it('should return the action for specialVideoCompleteCapture', () => {
    const result = getNewAction('specialVideoCompleteCapture')
    expect(result).toEqual(
      metaActions.find(
        (action) => action.type === 'specialVideoCompleteCapture'
      )
    )
    expect(result.type).toBe('specialVideoCompleteCapture')
    expect(result.label).toBe('Video Completed')
  })

  it('should return the action for custom1Capture', () => {
    const result = getNewAction('custom1Capture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'custom1Capture')
    )
    expect(result.type).toBe('custom1Capture')
    expect(result.label).toBe('Custom Event 1')
  })

  it('should return the action for custom2Capture', () => {
    const result = getNewAction('custom2Capture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'custom2Capture')
    )
    expect(result.type).toBe('custom2Capture')
    expect(result.label).toBe('Custom Event 2')
  })

  it('should return the action for custom3Capture', () => {
    const result = getNewAction('custom3Capture')
    expect(result).toEqual(
      metaActions.find((action) => action.type === 'custom3Capture')
    )
    expect(result.type).toBe('custom3Capture')
    expect(result.label).toBe('Custom Event 3')
  })

  it('should return the first metaAction (None) for empty string', () => {
    const result = getNewAction('')
    expect(result).toEqual(metaActions[0])
    expect(result.type).toBe('none')
  })
})
