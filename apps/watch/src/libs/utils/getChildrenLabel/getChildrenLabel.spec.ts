import { VideoLabel } from '../../../../__generated__/globalTypes'
import { getChildrenLabel } from './getChildrenLabel'

describe('getChildrenLabel', () => {
  it('should return items label by default', () => {
    expect(getChildrenLabel(VideoLabel.segment)).toEqual('items')
  })

  it('should return items label', () => {
    expect(getChildrenLabel(VideoLabel.collection)).toEqual('collections')
  })

  it('should return episodes label', () => {
    expect(getChildrenLabel(VideoLabel.series)).toEqual('episodes')
  })

  it('should return chapters label', () => {
    expect(getChildrenLabel(VideoLabel.featureFilm)).toEqual('featureFilms')
  })
})
