import { BaseHit, Hit } from 'instantsearch.js'

import type { AlgoliaVideo } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import type { VideoLabel } from '../../../../__generated__/globalTypes'
import type {
  VideoChildFields_imageAlt,
  VideoChildFields_images,
  VideoChildFields_snippet,
  VideoChildFields_title,
  VideoChildFields_variant
} from '../../../../__generated__/VideoChildFields'

export interface CoreVideo extends Hit<BaseHit> {
  __typename: 'Video'
  id: string
  label: VideoLabel
  title: VideoChildFields_title[]
  images: VideoChildFields_images[]
  imageAlt: VideoChildFields_imageAlt[]
  snippet: VideoChildFields_snippet[]
  slug: string
  variant: VideoChildFields_variant | null
  childrenCount: number
}

export function transformAlgoliaVideos(items: AlgoliaVideo[]): CoreVideo[] {
  return items.map((videoVariant) => ({
    __typename: 'Video',
    id: videoVariant.videoId,
    label: videoVariant.label as VideoLabel,
    title: [
      {
        __typename: 'VideoTitle',
        value: videoVariant.titles[0]
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: videoVariant.image
      }
    ],
    imageAlt: [
      {
        __typename: 'VideoImageAlt',
        value: videoVariant.imageAlt
      }
    ],
    snippet: [],
    slug: videoVariant.slug,
    variant: {
      id: videoVariant.objectID,
      duration: videoVariant.duration,
      hls: null,
      slug: videoVariant.slug,
      __typename: 'VideoVariant'
    },
    childrenCount: videoVariant.childrenCount
  })) as unknown as CoreVideo[]
}
