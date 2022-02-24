import { ReactElement, useState } from 'react'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded'
import RefreshRounded from '@mui/icons-material/RefreshRounded'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import { VideoListItem } from './VideoListItem'
import { arclightMediaUnits } from './VideoListData'

export function VideoList(): ReactElement {
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

  // use the MUI List

  return (
    <>
      <List disablePadding sx={{ width: '100%', px: 2 }}>
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
            />
            <Divider />
          </>
        ))}
      </List>
      {isLoading ? (
        <IconButton
          size="medium"
          sx={{ my: 4, mx: 'auto', backgroundColor: 'background.default' }}
        >
          <RefreshRounded />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          size="medium"
          disabled={visibleVidoes >= arclightContent}
          startIcon={
            arclightContent > visibleVidoes ? (
              <KeyboardArrowDownRounded />
            ) : null
          }
          onClick={handleClick}
          sx={{
            my: 4,
            mx: 'auto'
          }}
        >
          {arclightContent > visibleVidoes ? 'Load More' : 'No More Videos'}
        </Button>
      )}
    </>
  )
}
