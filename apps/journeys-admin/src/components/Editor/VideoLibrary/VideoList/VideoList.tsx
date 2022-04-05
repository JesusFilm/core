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
  query GetVideos($where: VideosFilter) {
    videos(where: $where) {
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
  onSelect: (source: string) => void
  currentLanguageIds?: string[]
  title?: string
}

export function VideoList({
  onSelect,
  currentLanguageIds,
  title
}: VideoListProps): ReactElement {
  const [visibleVideos, setVisibleVideos] = useState(4)

  const { loading, data } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      where: {
        availableVariantLanguageIds: currentLanguageIds,
        title: title != null ? title : null
      }
    }
  })

  const videosLength = data?.videos.length

  const handleClick = (): void => {
    setVisibleVideos((previousVisibleVideos) => previousVisibleVideos + 4)
  }

  return videosLength !== 0 ? (
    <>
      <List data-testid="VideoList" sx={{ px: 6 }}>
        <Divider />
        {data?.videos?.slice(0, visibleVideos).map((video) => (
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
      </List>
      <Box
        sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', my: 6 }}
      >
        <LoadingButton
          data-testid="VideoListLoadMore"
          variant="outlined"
          onClick={handleClick}
          loading={loading}
          startIcon={
            videosLength != null && visibleVideos >= videosLength ? null : (
              <AddRounded />
            )
          }
          disabled={videosLength != null && visibleVideos >= videosLength}
          loadingPosition="start"
          size="medium"
        >
          {videosLength != null && videosLength > visibleVideos
            ? 'Load More'
            : 'No More Videos'}
        </LoadingButton>
      </Box>
    </>
  ) : (
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
  )
}
