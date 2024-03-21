import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

interface VideoVariant {
  objectID: string
}

// interface Hit {
//   readonly objectID: string
//   readonly _highlightResult?: Record<string, unknown> | undefined
//   readonly _snippetResult?: Record<string, unknown> | undefined
//   readonly _rankingInfo?: RankingInfo | undefined
//   readonly _distinctSeqID?: number | undefined
// }

// interface Hits extends Array<Hit> {}

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
