import { VisitorStatus } from '../../../../../../__generated__/globalTypes'

import { getStatusIcon } from '.'

describe('getStatusIcon', () => {
  it('should return checkMarkSymbol', () => {
    const res = getStatusIcon(VisitorStatus.checkMarkSymbol)
    expect(res).toEqual('✅')
  })
  it('should return partyPopper', () => {
    const res = getStatusIcon(VisitorStatus.partyPopper)
    expect(res).toEqual('🎉')
  })
  it('should return prohibited', () => {
    const res = getStatusIcon(VisitorStatus.prohibited)
    expect(res).toEqual('🚫')
  })
  it('should return redExclamationMark', () => {
    const res = getStatusIcon(VisitorStatus.redExclamationMark)
    expect(res).toEqual('❗')
  })
  it('should return redQuestionMark', () => {
    const res = getStatusIcon(VisitorStatus.redQuestionMark)
    expect(res).toEqual('❓')
  })
  it('should return robotFace', () => {
    const res = getStatusIcon(VisitorStatus.robotFace)
    expect(res).toEqual('🤖')
  })
  it('should return star', () => {
    const res = getStatusIcon(VisitorStatus.star)
    expect(res).toEqual('⭐')
  })
  it('should return thumbsDown', () => {
    const res = getStatusIcon(VisitorStatus.thumbsDown)
    expect(res).toEqual('👎')
  })
  it('should return thumbsUp', () => {
    const res = getStatusIcon(VisitorStatus.thumbsUp)
    expect(res).toEqual('👍')
  })
  it('should return warning', () => {
    const res = getStatusIcon(VisitorStatus.warning)
    expect(res).toEqual('⚠')
  })
})
