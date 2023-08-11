import { VideoLabel } from '../../../../__generated__/globalTypes'

import { getLabelDetails } from './getLabelDetails'

describe('getLabelDetails', () => {
  it('should return default label details', () => {
    expect(getLabelDetails()).toEqual({
      label: 'Item',
      color: '#FFF',
      childLabel: 'Item',
      childCountLabel: '0 Items'
    })
  })

  it('should return collection label details', () => {
    expect(getLabelDetails(VideoLabel.collection)).toEqual({
      label: 'Collection',
      color: '#FF9E00',
      childLabel: 'Item',
      childCountLabel: '0 Items'
    })
  })

  it('should return episode label details', () => {
    expect(getLabelDetails(VideoLabel.episode)).toEqual({
      label: 'Episode',
      color: '#7283BE',
      childLabel: 'Item',
      childCountLabel: '0 Items'
    })
  })

  it('should return featureFilm label details', () => {
    expect(getLabelDetails(VideoLabel.featureFilm)).toEqual({
      label: 'Feature Film',
      color: '#FF9E00',
      childLabel: 'Chapter',
      childCountLabel: '0 Chapters'
    })
  })

  it('should return segment label details', () => {
    expect(getLabelDetails(VideoLabel.segment)).toEqual({
      label: 'Chapter',
      color: '#7283BE',
      childLabel: 'Item',
      childCountLabel: '0 Items'
    })
  })

  it('should return series label details', () => {
    expect(getLabelDetails(VideoLabel.series)).toEqual({
      label: 'Series',
      color: '#3AA74A',
      childLabel: 'Episode',
      childCountLabel: '0 Episodes'
    })
  })

  it('should return shortFilm label details', () => {
    expect(getLabelDetails(VideoLabel.shortFilm)).toEqual({
      label: 'Short Film',
      color: '#FF9E00',
      childLabel: 'Item',
      childCountLabel: '0 Items'
    })
  })

  it('should return single count child label', () => {
    expect(getLabelDetails(VideoLabel.featureFilm, 1)).toEqual({
      label: 'Feature Film',
      color: '#FF9E00',
      childLabel: 'Chapter',
      childCountLabel: '1 Chapter'
    })
  })

  it('should return multiple count child label', () => {
    expect(getLabelDetails(VideoLabel.featureFilm, 2)).toEqual({
      label: 'Feature Film',
      color: '#FF9E00',
      childLabel: 'Chapter',
      childCountLabel: '2 Chapters'
    })
  })
})
