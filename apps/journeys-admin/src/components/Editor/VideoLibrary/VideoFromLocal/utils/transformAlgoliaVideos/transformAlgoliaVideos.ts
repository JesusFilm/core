import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'
import type { geronimoType } from '../useVideoSearch/useVideoSearch'

export function transformAlgoliaVideos(hits): geronimoType {
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
