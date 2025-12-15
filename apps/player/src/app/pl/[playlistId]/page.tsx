import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { cache } from 'react'

import { PlaylistPage } from '@/components/PlaylistPage'
import { env } from '@/env'
import { getApolloClient } from '@/lib/apolloClient'
import { GET_PLAYLIST } from '@/lib/queries/getPlaylist'

interface PageProps {
  params: Promise<{
    playlistId: string
  }>
}

const getPlaylist = cache(async (playlistId: string) => {
  const { data } = await getApolloClient().query({
    query: GET_PLAYLIST,
    variables: {
      id: playlistId,
      idType: 'slug'
    }
  })

  return data
})

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  const p = await getTranslations('PlaylistRoutePage')
  const params = await props.params
  const playlistId = params.playlistId

  const data = await getPlaylist(playlistId)

  if (
    !data?.playlist ||
    'message' in data.playlist ||
    data.playlist.__typename !== 'QueryPlaylistSuccess'
  ) {
    return {
      title: t('pageTitle', { title: p('title') }),
      other: {
        'apple-itunes-app': `app-id=${env.NEXT_PUBLIC_IOS_APP_ID}; app-argument=https://player.jesusfilmproject.org/p/${playlistId}`
      }
    }
  }

  const playlist = data.playlist.data

  return {
    title: t('pageTitle', { title: playlist.name })
  }
}

export default async function PlaylistRoutePage(props: PageProps) {
  const t = await getTranslations('PlaylistRoutePage')
  const params = await props.params
  const playlistId = params.playlistId

  const data = await getPlaylist(playlistId)

  if (!data?.playlist || 'message' in data.playlist) {
    notFound()
  }

  if (data.playlist.__typename !== 'QueryPlaylistSuccess') {
    notFound()
  }

  const playlist = data.playlist.data

  if (!playlist.items || playlist.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">{playlist.name}</h1>
          <p className="mb-1 text-gray-600">
            {playlist.owner.firstName}
            {playlist.owner.lastName ? ` ${playlist.owner.lastName}` : ''}
          </p>
          <p className="text-text-secondary">{t('thisPlaylistIsEmpty')}</p>
        </div>
      </div>
    )
  }

  return <PlaylistPage playlist={playlist} />
}
