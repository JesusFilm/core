import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'
import { query } from '@/lib/apolloRsc'
import { graphql } from '@core/shared/gql'
import { notFound } from 'next/navigation'
import { VideoPlaylist } from '@/components/VideoPlaylist'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ModernTestPage')
  const m = await getTranslations('Metadata')

  return {
    title: m('pageTitle', { title: t('pageTitle') })
  }
}

export default async function PlaylistPage({
  params
}: {
  params: Promise<{ playlistSlug: string }>
}): Promise<ReactElement> {
  const t = await getTranslations('ModernTestPage')
  const { playlistSlug } = await params
  const { data } = await query({
    query: graphql(`
      query GetPlaylist($playlistSlug: ID!) {
        playlist(id: $playlistSlug, idType: slug) {
          ... on QueryPlaylistSuccess {
            __typename
            data {
              id
              name
              items {
                id
                order
                createdAt
                videoVariant {
                  id
                  hls
                  duration
                  video {
                    title {
                      value
                      primary
                    }
                    images {
                      thumbnail
                    }
                  }
                }
              }
            }
          }
          ... on NotFoundError {
            __typename
            message
            location {
              path
              value
            }
          }
        }
      }
    `),
    variables: {
      playlistSlug
    }
  })

  if (data?.playlist == null || data.playlist.__typename === 'NotFoundError') {
    return notFound()
  }

  return <VideoPlaylist playlist={data.playlist.data} />
}
