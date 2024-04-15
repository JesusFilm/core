import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

export function transformAlgoliaVideos(hits): VideoChildFields[] {
  return hits.map((videoVariant) => {
    return {
      id: videoVariant.videoId,
      label: videoVariant.label,
      title: [{ value: videoVariant.titles.map((title) => title) }],
      image: videoVariant.image,
      imageAlt: videoVariant.imageAlt,
      snippet: [],
      slug: videoVariant.slug,
      variant: {
        id: videoVariant.objectID,
        duration: videoVariant.duration,
        hls: null,
        slug: videoVariant.slug
      },
      childrenCount: videoVariant.childrenCount
    }
  })
}
