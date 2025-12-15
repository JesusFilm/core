import { cache } from 'react'

import { getApolloClient } from '@/lib/apolloClient'
import { GET_PLAYLIST } from '@/lib/queries/getPlaylist'

export const getPlaylist = cache(async (playlistId: string) => {
  const { data } = await getApolloClient().query({
    query: GET_PLAYLIST,
    variables: {
      id: playlistId,
      idType: 'slug'
    }
  })

  return data
})
