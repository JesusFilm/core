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
            title={arclight.descriptors.nodes[2].value}
            description={arclight.descriptors.nodes[1].value}
            poster={arclight.visuals.nodes[0].url}
          />
          <Divider />
        </>
      ))}
    </Box>
  )
}
