import { getVideoChildrenLabel } from './getVideoChildrenLabel'

describe('getVideoChildrenLabel', () => {
  it('should get Items label from a collection', () => {
    const res = getVideoChildrenLabel('collection')
    expect(res).toEqual('Items')
  })
  it('should get Items label from a collection', () => {
    const res = getVideoChildrenLabel('featureFilm')
    expect(res).toEqual('Clips')
  })

  it('should get Items label from a collection', () => {
    const res = getVideoChildrenLabel('series')
    expect(res).toEqual('Episodes')
  })

  it('should return undefined if video label is not recognized', () => {
    const res = getVideoChildrenLabel('trailer')
    expect(res).toEqual(undefined)
  })
})
