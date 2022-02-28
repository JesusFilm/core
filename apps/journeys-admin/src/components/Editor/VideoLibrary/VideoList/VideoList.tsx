import { ReactElement, useState } from 'react'
import Divider from '@mui/material/Divider'
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded'
import RefreshRounded from '@mui/icons-material/RefreshRounded'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Chip from '@mui/material/Chip'
import { Box } from '@mui/system'
import { VideoListItem } from './VideoListItem'
import { arclightMediaUnits } from './VideoListData'

interface VideoListProps {
  onSelect: (id: string) => void
}

export function VideoList({ onSelect }: VideoListProps): ReactElement {
  const [visibleVidoes, setVisibleVideos] = useState(4)
  const [isLoading, setIsLoading] = useState(false)

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
      <List sx={{ px: 2 }}>
        <Divider />
        {arclightMediaUnits.nodes.slice(0, visibleVidoes).map((arclight) => (
          <>
            <VideoListItem
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
      <Box sx={{ mx: 'auto', my: 6 }}>
        {isLoading ? (
          <IconButton
            size="medium"
            sx={{ backgroundColor: 'background.default' }}
          >
            <RefreshRounded />
          </IconButton>
        ) : (
          <Chip
            data-testid="video-list-chip"
            size="medium"
            disabled={visibleVidoes >= arclightContent}
            icon={
              arclightContent > visibleVidoes ? (
                <KeyboardArrowDownRounded />
              ) : (
                <></>
              )
            }
            sx={{ py: 5, borderRadius: 30 }}
            onClick={handleClick}
            label={
              arclightContent > visibleVidoes ? 'Load More' : 'No More Videos'
            }
          />
        )}
      </Box>
    </>
  )
}
