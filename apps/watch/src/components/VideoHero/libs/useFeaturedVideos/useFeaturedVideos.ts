import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import {
  GetVideoChildren,
  GetVideoChildren_video_children
} from '../../../../../../../apps/watch/__generated__/GetVideoChildren'
import { getLanguageIdFromLocale } from '../../../../libs/getLanguageIdFromLocale'
import { VIDEO_CONTENT_FIELDS } from '../../../../libs/videoContentFields'

export const GET_FEATURED_VIDEOS = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetFeaturedVideos($languageId: ID) {
    video(id: "new-believer-course/english", idType: slug) {
      id
      children {
        ...VideoContentFields
      }
    }
  }
`

export function useFeaturedVideos(
  locale?: string
): {
  loading: boolean
  videos: GetVideoChildren_video_children[]
} {
  const { loading, data } = useQuery<GetVideoChildren>(GET_FEATURED_VIDEOS, {
    variables: { languageId: getLanguageIdFromLocale(locale) },
    // variant children are not cached properly
    fetchPolicy: 'no-cache'
  })

  const videos = useMemo(() => {
    return data?.video?.children != null
      ? data.video.children.filter((child) => child.variant != null)
      : []
  }, [data])

  return {
    loading,
    videos
  }
}
