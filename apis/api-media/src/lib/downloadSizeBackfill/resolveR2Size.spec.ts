import { resolveR2Size } from './resolveR2Size'

describe('resolveR2Size', () => {
  it('returns the positive content length from the linked asset', () => {
    expect(resolveR2Size({ contentLength: BigInt(243808898) })).toEqual({
      size: 243808898,
      errorCode: null
    })
  })

  it('reports a missing asset', () => {
    expect(resolveR2Size(null)).toEqual({
      size: null,
      errorCode: 'missingAsset'
    })
  })

  it('reports an invalid length when the asset content length is zero', () => {
    expect(resolveR2Size({ contentLength: BigInt(0) })).toEqual({
      size: null,
      errorCode: 'invalidLength'
    })
  })
})
