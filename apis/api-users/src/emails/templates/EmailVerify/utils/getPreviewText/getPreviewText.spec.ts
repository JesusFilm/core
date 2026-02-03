import { getPreviewText } from './getPreviewText'

describe('getPreviewText', () => {
  it('returns Jesus Film Project preview text when app is Default', () => {
    expect(getPreviewText('Default')).toBe(
      'Verify your email address with the Jesus Film Project'
    )
  })

  it('returns Next Steps preview text when app is NextSteps', () => {
    expect(getPreviewText('NextSteps')).toBe(
      'Verify your email address on Next Steps'
    )
  })
})
