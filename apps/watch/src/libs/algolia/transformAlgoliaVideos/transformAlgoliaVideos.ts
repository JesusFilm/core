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

export function transformAlgoliaVideos(
  items: AlgoliaVideo[],
  languageId?: string
): CoreVideo[] {
  return items.map((videoVariant) => {
    let title = ''
    if (
      videoVariant.titlesWithLanguages != null &&
      videoVariant.titlesWithLanguages.length > 0
    ) {
      title =
        videoVariant.titlesWithLanguages.find(
          (title) => title.languageId === languageId
        )?.value ?? videoVariant.titlesWithLanguages[0]?.value
    } else if (videoVariant.titles != null && videoVariant.titles.length > 0) {
      title = videoVariant.titles[0]
    }

    return {
      __typename: 'Video',
      id: videoVariant.videoId,
      label: videoVariant.label as VideoLabel,
      title: [
        {
          __typename: 'VideoTitle',
          value: title
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
    }
  }) as unknown as CoreVideo[]
}
