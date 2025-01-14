import DragHandle from '@mui/icons-material/DragHandle'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, SyntheticEvent, useRef, useState } from 'react'
import { Resizable, ResizeCallbackData } from 'react-resizable'

import type { TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'

import { SpacerFields } from './__generated__/SpacerFields'

export const Spacer = ({ spacing }: TreeBlock<SpacerFields>): ReactElement => {
  const { variant } = useJourney()
  const [height, setHeight] = useState(100)
  const handleRef = useRef(null)

  function onResize(
    _event: SyntheticEvent,
    { size: { height } }: ResizeCallbackData
  ) {
    setHeight(height)
  }

  return (
    <Resizable
      height={height}
      axis="y"
      onResize={onResize}
      handle={
        <DragHandle
          ref={handleRef}
          sx={{
            color: 'white',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, 0)',
            cursor: 'ns-resize'
          }}
        />
      }
    >
      <Box
        sx={{
          mb: 4,
          height: height,
          bgcolor:
            variant === 'admin' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0)',
          borderRadius: '6px',
          position: 'relative'
        }}
        data-testid="JourneysTextResponse"
      >
        <Typography align="center">{`${height} pixels`}</Typography>
      </Box>
    </Resizable>
  )
}
