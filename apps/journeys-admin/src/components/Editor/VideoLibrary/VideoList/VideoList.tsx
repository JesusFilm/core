import { ReactElement, useEffect, useState } from 'react'
import Divider from '@mui/material/Divider'
import LoadingButton from '@mui/lab/LoadingButton'
import AddRounded from '@mui/icons-material/AddRounded'
import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import { GetVideos } from '../../../../../__generated__/GetVideos'
import { VideoListItem } from './VideoListItem'

export const GET_VIDEOS = gql`
  query GetVideos($where: VideosFilter, $limit: Int!, $offset: Int!) {
    videos(where: $where, limit: $limit, offset: $offset) {
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
        id
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
  title = ''
}: VideoListProps): ReactElement {
  const { loading, data, fetchMore } = useQuery<GetVideos>(GET_VIDEOS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: currentLanguageIds,
        title: title === '' ? null : title
      }
    }
  })
  const [noMoreVideos, setNoMoreVideos] = useState(false)

  useEffect(() => setNoMoreVideos(false), [currentLanguageIds, title])

  return (
    <>
      <List data-testid="VideoList" sx={{ px: 6 }}>
        <Divider />
        {data?.videos?.map((video) => (
          <VideoListItem
            id={video.id}
            title={video.title.find(({ primary }) => primary)?.value}
            description={video.snippet.find(({ primary }) => primary)?.value}
            image={video.image ?? ''}
            duration={video.variant?.duration}
            onSelect={onSelect}
            key={video.id}
          />
        ))}
        {loading &&
          new Array(5).fill(undefined).map((_val, index) => (
            <ListItem
              sx={{ alignItems: 'flex-start', p: 3 }}
              key={index}
              divider
            >
              <ListItemText
                primary={<Skeleton variant="text" width="65%" />}
                secondary={
                  <>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="85%" />
                  </>
                }
                secondaryTypographyProps={{
                  style: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              />
              <Skeleton
                variant="rectangular"
                width={79}
                height={79}
                sx={{ borderRadius: 2, ml: 2 }}
              />
            </ListItem>
          ))}
        {data?.videos?.length === 0 && !loading && (
          <ListItem sx={{ p: 3 }} divider>
            <ListItemText
              primary="No Results Found"
              secondary="If you are searching for videos in a different language, please select it first in the dropdown above."
              secondaryTypographyProps={{
                style: {
                  overflow: 'hidden',
                  paddingTop: '4px'
                }
              }}
            />
          </ListItem>
        )}
      </List>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', my: 6 }}
      >
        <LoadingButton
          variant="outlined"
          onClick={async () => {
            const response = await fetchMore({
              variables: {
                offset: data?.videos?.length ?? 0
              }
            })
            if (response.data?.videos?.length === 0) setNoMoreVideos(true)
          }}
          loading={loading}
          startIcon={<AddRounded />}
          size="medium"
          disabled={(data?.videos?.length === 0 && !loading) || noMoreVideos}
        >
          {data?.videos?.length === 0 || noMoreVideos
            ? 'No More Videos'
            : 'Load More'}
        </LoadingButton>
      </Box>
    </>
  )
}
