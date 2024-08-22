'use client'

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
// import { unstable_noStore as noStore } from 'next/cache'
// import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

const GET_VIDEOS = graphql(`
  query GetVideos($limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      id
      title {
        value
      }
    }
  }
`)

export async function VideoList(): Promise<ReactElement> {
  //   const t = useTranslations()

  //   noStore()

  const { data } = useSuspenseQuery(GET_VIDEOS, {
    variables: { limit: 50, offset: 0 }
  })

  return (
    <Box>
      <Typography>{JSON.stringify(data)}</Typography>
    </Box>
  )
}
