import { VideoBlockSource } from '../../../../../../../../../../__generated__/globalTypes'
import type { LocalVideoFields } from '../useVideoSearch/useVideoSearch'

export function transformAlgoliaVideos(hits): LocalVideoFields {
  console.log(hits)
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
