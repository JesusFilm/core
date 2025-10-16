import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'

import type { SpacerFields } from './spacerFields'

export const Spacer = ({ spacing }: TreeBlock<SpacerFields>): ReactElement => {
  const { variant } = useJourney()

  return (
    <Box
      sx={{
        mb: 4,
        height: spacing ?? 100,
        bgcolor: 'rgba(0,0,0,0)',
        borderRadius: '6px',
        outline: (theme) =>
          variant === 'admin' ? `4px dashed ${theme.palette.divider}` : 'none',
        outlineOffset: -4,
        transition: (theme) =>
          theme.transitions.create('height', { duration: 200 })
      }}
      data-testid="JourneysSpacer"
    />
  )
}
