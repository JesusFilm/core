import { videos } from '../../Videos/__generated__/testData'
import {
  getRelatedVideos,
  getSortedChildren,
  getUniqueSiblings
} from './getRelatedVideos'

describe('getRelatedVideos', () => {
  it('should filter out duplicate siblings from children', () => {
    const uniqueSiblings = getUniqueSiblings({
      siblings: [videos[0], videos[1], videos[2]],
      children: [videos[2], videos[1]]
    })
    expect(uniqueSiblings).toMatchObject([videos[0]])
  })

  it('should group episode and segment child videos', () => {
    const featureFilm = videos[0]
    const segment = videos[2]
    const series = videos[5]
    const episode = videos[6]
    const shortFilm = videos[12]
    const collection = videos[9]
    const segment1 = videos[0].children[0]
    const segment2 = videos[0].children[1]

    const sortedSegments = getSortedChildren([
      segment,
      series,
      episode,
      shortFilm,
      collection,
      featureFilm,
      segment1,
      segment2
    ])
    expect(sortedSegments).toMatchObject([
      [segment, segment1, segment2],
      series,
      [episode],
      shortFilm,
      collection,
      featureFilm
    ])
  })

  it('should order siblings after children', () => {
    const relatedVideos = getRelatedVideos({
      children: [videos[2], videos[1]],
      siblings: [videos[0], videos[1], videos[2]]
    })
    expect(relatedVideos).toMatchObject([[videos[2]], videos[1], videos[0]])
  })

  it('should return sorted children only if no siblings', () => {
    const relatedVideos = getRelatedVideos({
      children: [videos[2], videos[1]]
    })
    expect(relatedVideos).toMatchObject([[videos[2]], videos[1]])
  })

  it('should return siblings only if no children', () => {
    const relatedVideos = getRelatedVideos({
      children: [],
      siblings: [videos[0], videos[1], videos[2]]
    })
    expect(relatedVideos).toMatchObject([videos[0], videos[1], videos[2]])
  })
})
