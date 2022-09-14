import { ReactElement } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import AddRounded from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { VideoListItem } from './VideoListItem'
import { VideoListItemProps } from './VideoListItem/VideoListItem'

export interface VideoListProps {
  onSelect: (block: VideoBlockUpdateInput) => void
  loading: boolean
  videos?: Array<
    Pick<
      VideoListItemProps,
      'id' | 'title' | 'description' | 'image' | 'duration'
    >
  >
  fetchMore: () => Promise<void>
  hasMore: boolean
  VideoDetails: VideoListItemProps['VideoDetails']
}

export function VideoList({
  onSelect,
  loading,
  videos,
  fetchMore,
  hasMore,
  VideoDetails
}: VideoListProps): ReactElement {
  return (
    <>
      <List data-testid="VideoList" sx={{ py: 0, px: 6 }}>
        {videos?.map((video) => (
          <VideoListItem
            {...video}
            onSelect={onSelect}
            key={video.id}
            VideoDetails={VideoDetails}
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
        {videos?.length === 0 && !loading && (
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
          onClick={fetchMore}
          loading={loading}
          startIcon={<AddRounded />}
          size="medium"
          disabled={(videos?.length === 0 && !loading) || !hasMore}
        >
          {videos?.length === 0 || !hasMore ? 'No More Videos' : 'Load More'}
        </LoadingButton>
      </Box>
    </>
  )
}
