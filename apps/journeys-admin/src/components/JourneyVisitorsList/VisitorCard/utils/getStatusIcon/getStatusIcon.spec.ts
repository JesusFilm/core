import { VisitorStatus } from '../../../../../../__generated__/globalTypes'

import { getStatusIcon } from '.'

describe('getStatusIcon', () => {
  it('should return checkMarkSymbol', () => {
    const res = getStatusIcon(VisitorStatus.checkMarkSymbol)
    expect(res).toBe('✅')
  })

  it('should return partyPopper', () => {
    const res = getStatusIcon(VisitorStatus.partyPopper)
    expect(res).toBe('🎉')
  })

  it('should return prohibited', () => {
    const res = getStatusIcon(VisitorStatus.prohibited)
    expect(res).toBe('🚫')
  })

  it('should return redExclamationMark', () => {
    const res = getStatusIcon(VisitorStatus.redExclamationMark)
    expect(res).toBe('❗')
  })

  it('should return redQuestionMark', () => {
    const res = getStatusIcon(VisitorStatus.redQuestionMark)
    expect(res).toBe('❓')
  })

  it('should return robotFace', () => {
    const res = getStatusIcon(VisitorStatus.robotFace)
    expect(res).toBe('🤖')
  })

  it('should return star', () => {
    const res = getStatusIcon(VisitorStatus.star)
    expect(res).toBe('⭐')
  })

  it('should return thumbsDown', () => {
    const res = getStatusIcon(VisitorStatus.thumbsDown)
    expect(res).toBe('👎')
  })

  it('should return thumbsUp', () => {
    const res = getStatusIcon(VisitorStatus.thumbsUp)
    expect(res).toBe('👍')
  })

  it('should return warning', () => {
    const res = getStatusIcon(VisitorStatus.warning)
    expect(res).toBe('⚠')
  })
})
