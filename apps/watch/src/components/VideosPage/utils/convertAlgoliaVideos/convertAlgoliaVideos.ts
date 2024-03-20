import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

interface VideoVariant {
  objectID: string
}

export function convertAlgoliaVideos(hits): VideoChildFields[] {
  return hits.map((videoVariant) => {
    return {
      id: videoVariant.videoId,
      label: videoVariant.label,
      title: [{ value: videoVariant.titles.map((title) => title) }],
      image: videoVariant.image,
      imageAlt: videoVariant.imageAlt,
      snippet: [],
      slug: videoVariant.slug,
      variant: null,
      childrenCount: videoVariant.childrenCount
    }
  })
}
