import { ReactElement, useState } from 'react'
import Divider from '@mui/material/Divider'
import LoadingButton from '@mui/lab/LoadingButton'
import AddRounded from '@mui/icons-material/AddRounded'
import List from '@mui/material/List'
import { Box } from '@mui/system'
import { VideoListItem } from './VideoListItem'
import { arclightMediaUnits } from './VideoListData'

interface VideoListProps {
  onSelect: (id: string) => void
}

export function VideoList({ onSelect }: VideoListProps): ReactElement {
  const [visibleVideos, setVisibleVideos] = useState(4)
  const [isLoading, setIsLoading] = useState(false)

  // to be replaced with the query
  const arclightContent = arclightMediaUnits.nodes.length

  const handleClick = (): void => {
    setIsLoading(true)
    setTimeout(
      () =>
        setVisibleVideos((previousVisibleVideos) => previousVisibleVideos + 4),
      1000
    )
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <>
      <List sx={{ px: 6 }}>
        <Divider />
        {arclightMediaUnits.nodes.slice(0, visibleVideos).map((arclight) => (
          <>
            <VideoListItem
              id={arclight.uuid}
              title={
                arclight.descriptors.nodes.find(
                  (type) => type.descriptorType === 'TITLE'
                )?.value
              }
              description={
                arclight.descriptors.nodes.find(
                  (type) => type.descriptorType === 'SHORT_DESCRIPTION'
                )?.value
              }
              poster={
                arclight.visuals.nodes.find(
                  (type) => type.visualType === 'THUMBNAIL'
                )?.url
              }
              time={arclight.trackRecordings.nodes[0].durationMilliseconds}
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
          variant="outlined"
          onClick={handleClick}
          loading={isLoading}
          startIcon={visibleVideos >= arclightContent ? null : <AddRounded />}
          disabled={visibleVideos >= arclightContent}
          loadingPosition="start"
          size="medium"
        >
          {arclightContent > visibleVideos ? 'Load More' : 'No More Videos'}
        </LoadingButton>
      </Box>
    </>
  )
}
