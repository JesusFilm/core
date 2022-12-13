import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoContentFields_children as VideoChildren } from '../../../../__generated__/VideoContentFields'
import { getChildrenLabel } from './getChildrenLabel'

describe('getChildrenLabel', () => {
  it('should return items label', () => {
    const children = [
      { label: VideoLabel.collection } as unknown as VideoChildren,
      { label: VideoLabel.series } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('items')
  })

  it('should return collections label', () => {
    const children = [
      { label: VideoLabel.collection } as unknown as VideoChildren,
      { label: VideoLabel.collection } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('collections')
  })

  it('should return episodes label', () => {
    const children = [
      { label: VideoLabel.episode } as unknown as VideoChildren,
      { label: VideoLabel.episode } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('episodes')
  })

  it('should return featureFilms label', () => {
    const children = [
      { label: VideoLabel.featureFilm } as unknown as VideoChildren,
      { label: VideoLabel.featureFilm } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('featureFilms')
  })

  it('should return segments label', () => {
    const children = [
      { label: VideoLabel.segment } as unknown as VideoChildren,
      { label: VideoLabel.segment } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('segments')
  })

  it('should return series label', () => {
    const children = [
      { label: VideoLabel.series } as unknown as VideoChildren,
      { label: VideoLabel.series } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('series')
  })

  it('should return short films label', () => {
    const children = [
      { label: VideoLabel.shortFilm } as unknown as VideoChildren,
      { label: VideoLabel.shortFilm } as unknown as VideoChildren
    ]
    const label = getChildrenLabel(children)
    expect(label).toEqual('shortFilms')
  })
})
