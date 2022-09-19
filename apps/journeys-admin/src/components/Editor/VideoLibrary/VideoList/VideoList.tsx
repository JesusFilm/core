import { Fragment, ReactElement } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import AddRounded from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'
import { VideoBlockUpdateInput } from '../../../../../__generated__/globalTypes'
import { VideoListItem } from './VideoListItem'
import { VideoListItemProps } from './VideoListItem/VideoListItem'

export interface VideoListProps {
  onSelect: (block: VideoBlockUpdateInput) => void
  loading: boolean
  videos?: Array<
    Pick<
      VideoListItemProps,
      'id' | 'title' | 'description' | 'image' | 'duration' | 'source'
    >
  >
  fetchMore: () => Promise<void>
  hasMore: boolean
}

export function VideoList({
  onSelect,
  loading,
  videos,
  fetchMore,
  hasMore
}: VideoListProps): ReactElement {
  return (
    <>
      <Divider sx={{ mx: 6 }} />
      <List data-testid="VideoList" sx={{ p: 0 }} component="div">
        {videos?.map((video) => (
          <Fragment key={video.id}>
            <VideoListItem {...video} onSelect={onSelect} />
            <Divider sx={{ mx: 6 }} />
          </Fragment>
        ))}
        {loading &&
          new Array(5).fill(undefined).map((_val, index) => (
            <Fragment key={index}>
              <ListItem sx={{ alignItems: 'flex-start', py: 4, px: 6 }}>
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
              <Divider sx={{ mx: 6 }} />
            </Fragment>
          ))}
        {videos?.length === 0 && !loading && (
          <>
            <ListItem sx={{ py: 4, px: 6 }}>
              <ListItemText primary="No Results Found" />
            </ListItem>
            <Divider sx={{ mx: 6 }} />
          </>
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
