import Divider from '@mui/material/Divider'
import Box from '@mui/system/Box'
import { ReactElement } from 'react'
import { VideoListItem } from './VideoListItem'
import { arclightMediaUnits } from './VideoListData'

export function VideoList(): ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: 4,
        py: 4
      }}
    >
      <Divider />
      {arclightMediaUnits.nodes.map((arclight) => (
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
    </Box>
  )
}
