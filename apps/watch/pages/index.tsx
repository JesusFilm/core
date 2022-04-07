import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import { useQuery, gql } from '@apollo/client'

import { VideoList } from '../src/components/Videos/VideoList/VideoList'
import { GetVideoTag } from '../__generated__/GET_VIDEO_TAG'
import { VideoType } from '../__generated__/globalTypes'

export const GET_VIDEO_TAG = gql`
  query GetVideoTag($id: ID!) {
    videoTag(id: $id) {
      id
      title {
        primary
        value
      }
    }
  }
`

function VideoPage(): ReactElement {
  const { data: jfm1Data } = useQuery<GetVideoTag>(GET_VIDEO_TAG, {
    variables: {
      id: 'JFM1'
    }
  })
  return (
    <>
      <Typography variant="h1">
        {jfm1Data?.videoTag?.title.find((t) => t.primary).value}
      </Typography>
      <VideoList
        filter={{
          availableVariantLanguageIds: ['529'],
          types: [VideoType.playlist, VideoType.standalone],
          tagId: 'JFM1'
        }}
        layout="carousel"
      />
    </>
  )
}

export default VideoPage
