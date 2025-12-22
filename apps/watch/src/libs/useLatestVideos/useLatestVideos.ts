import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import type {
  GetLatestVideos,
  GetLatestVideosVariables
} from '../../../__generated__/GetLatestVideos'
import { VIDEO_CHILD_FIELDS } from '../videoChildFields'

const GET_LATEST_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetLatestVideos($where: VideosFilter, $languageId: ID, $limit: Int) {
    videos(where: $where, limit: $limit) {
      ...VideoChildFields
      publishedAt
    }
  }
`

interface UseLatestVideosOptions {
  languageId?: string
  limit?: number
  skip?: boolean
}

export function useLatestVideos({
  languageId,
  limit = 12,
  skip = false
}: UseLatestVideosOptions = {}) {
  const where = useMemo(
    () =>
      languageId != null
        ? { availableVariantLanguageIds: [languageId] }
        : undefined,
    [languageId]
  )

  const { data, loading } = useQuery<GetLatestVideos, GetLatestVideosVariables>(
    GET_LATEST_VIDEOS,
    {
      variables: {
        languageId,
        where,
        limit
      },
      fetchPolicy: 'cache-first',
      skip
    }
  )

  const videos = useMemo(() => {
    const items = data?.videos ?? []

    return [...items]
      .sort((a, b) => {
        const first = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const second = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return second - first
      })
      .slice(0, limit)
  }, [data?.videos, limit])

  return {
    videos,
    loading
  }
}

export { GET_LATEST_VIDEOS }
