import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getApolloClient } from '../../../lib/apolloClient'
import { GET_PLAYLIST } from '../../../lib/queries/getPlaylist'

import { PlaylistPage } from '@/components/PlaylistPage'

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
  const params = await props.params
  const playlistId = params.playlistId

  const data = await getPlaylist(playlistId)

  if (
    !data?.playlist ||
    'message' in data.playlist ||
    data.playlist.__typename !== 'QueryPlaylistSuccess'
  ) {
    return {
      title: 'Playlist | Jesus Film Project'
    }
  }

  const playlist = data.playlist.data

  return {
    title: `${playlist.name} | Jesus Film Project`
  }
}

export default async function PlaylistRoutePage(props: PageProps) {
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
          <p className="text-text-secondary">This playlist is empty</p>
        </div>
      </div>
    )
  }

  return <PlaylistPage playlist={playlist} />
}
