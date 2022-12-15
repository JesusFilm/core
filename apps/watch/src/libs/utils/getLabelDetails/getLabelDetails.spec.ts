import { VideoLabel } from '../../../../__generated__/globalTypes'
import { getLabelDetails } from './getLabelDetails'

describe('getLabelDetails', () => {
  it('should return default label details', () => {
    expect(getLabelDetails()).toEqual({
      label: 'Item',
      color: '#FFF',
      childLabel: 'items'
    })
  })

  it('should return collection label details', () => {
    expect(getLabelDetails(VideoLabel.collection)).toEqual({
      label: 'Collection',
      color: '#FF9E00',
      childLabel: 'items'
    })
  })
  it('should return episode label details', () => {
    expect(getLabelDetails(VideoLabel.episode)).toEqual({
      label: 'Episode',
      color: '#7283BE',
      childLabel: 'items'
    })
  })
  it('should return featureFilm label details', () => {
    expect(getLabelDetails(VideoLabel.featureFilm)).toEqual({
      label: 'Feature Film',
      color: '#FF9E00',
      childLabel: 'chapters'
    })
  })
  it('should return segment label details', () => {
    expect(getLabelDetails(VideoLabel.segment)).toEqual({
      label: 'Chapter',
      color: '#7283BE',
      childLabel: 'items'
    })
  })
  it('should return series label details', () => {
    expect(getLabelDetails(VideoLabel.series)).toEqual({
      label: 'Series',
      color: '#3AA74A',
      childLabel: 'episodes'
    })
  })
  it('should return shortFilm label details', () => {
    expect(getLabelDetails(VideoLabel.shortFilm)).toEqual({
      label: 'Short Film',
      color: '#FF9E00',
      childLabel: 'items'
    })
  })
})
