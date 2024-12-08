import { getVideoChildrenLabel } from './getVideoChildrenLabel'

describe('getVideoChildrenLabel', () => {
  it('should get Items label from a collection', () => {
    const res = getVideoChildrenLabel('collection')
    expect(res).toBe('Items')
  })

  it('should get Clips label from a collection', () => {
    const res = getVideoChildrenLabel('featureFilm')
    expect(res).toBe('Clips')
  })

  it('should get Episodes label from a collection', () => {
    const res = getVideoChildrenLabel('series')
    expect(res).toBe('Episodes')
  })

  it('should return undefined if video label is not recognized', () => {
    const res = getVideoChildrenLabel('trailer')
    expect(res).toBeUndefined()
  })
})
