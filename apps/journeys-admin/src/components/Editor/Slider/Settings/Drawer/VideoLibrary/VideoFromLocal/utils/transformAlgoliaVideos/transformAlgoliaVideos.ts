import { VideoBlockSource } from '../../../../../../../../../../__generated__/globalTypes'
import type { LocalVideoFields } from '../useVideoSearch/useVideoSearch'

interface AlgoliaVideoVariant {
  videoId: string
  titles: string[]
  description: string[]
  duration: number
  image: string
  languageId: string
}

interface AlgoliaVideoVariants extends Array<AlgoliaVideoVariant> {}

export function transformAlgoliaVideos(
  hits: AlgoliaVideoVariants
): LocalVideoFields {
  return hits.map((videoVariant) => {
    return {
      id: videoVariant.videoId,
      title: videoVariant.titles[0],
      description: videoVariant.description[0],
      image: videoVariant.image,
      duration: videoVariant.duration,
      source: VideoBlockSource.internal
    }
  })
}
