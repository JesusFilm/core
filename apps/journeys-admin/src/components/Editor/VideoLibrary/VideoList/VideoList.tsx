import { ReactElement, useState } from 'react'
import Divider from '@mui/material/Divider'
import LoadingButton from '@mui/lab/LoadingButton'
import AddRounded from '@mui/icons-material/AddRounded'
import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { GetVideos } from '../../../../../__generated__/GetVideos'
import { VideoListItem } from './VideoListItem'

export const GET_VIDEOS = gql`
  query GetVideos($where: VideosFilter, $limit: Int!, $page: Int!) {
    videos(where: $where, limit: $limit, page: $page) {
      id
      image
      snippet {
        primary
        value
      }
      title {
        primary
        value
      }
      variant {
        duration
      }
    }
  }
`

interface VideoListProps {
  onSelect: (videoId: string, videoVariantLanguageId?: string) => void
  currentLanguageIds?: string[]
  title?: string
}

export function VideoList({
  onSelect,
  currentLanguageIds,
  title
}: VideoListProps): ReactElement {
  const { loading, data, fetchMore } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      page: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: currentLanguageIds,
        title: title != null ? title : null
      }
    }
  })

  return (
    <>
      <List data-testid="VideoList" sx={{ px: 6 }}>
        <Divider />
        {data?.videos?.map((video) => (
          <>
            <VideoListItem
              id={video.id}
              title={video.title.find(({ primary }) => primary)?.value}
              description={video.snippet.find(({ primary }) => primary)?.value}
              image={video.image ?? ''}
              duration={video.variant?.duration}
              onSelect={onSelect}
            />
            <Divider />
          </>
        ))}
        <ListItem
          sx={{
            px: 6
          }}
        >
          <ListItemText
            primary="No Results Found"
            secondary="If you search videos in a different language, please select it first in the dropdown above."
            secondaryTypographyProps={{
              style: {
                overflow: 'hidden',
                paddingTop: '4px'
              }
            }}
          />
        </ListItem>
      </List>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', my: 6 }}
      >
        <LoadingButton
          data-testid="VideoListLoadMore"
          variant="outlined"
          onClick={async () =>
            await fetchMore({
              variables: {
                page: 1
              }
            })
          }
          loading={loading}
          startIcon={<AddRounded />}
          loadingPosition="start"
          size="medium"
        >
          Load More
        </LoadingButton>
      </Box>
    </>
  )
}
