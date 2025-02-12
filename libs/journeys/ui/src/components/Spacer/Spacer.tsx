import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'

import { SpacerFields } from './__generated__/SpacerFields'

export const Spacer = ({ spacing }: TreeBlock<SpacerFields>): ReactElement => {
  const { variant } = useJourney()

  return (
    <Box
      sx={{
        mb: 4,
        height: spacing,
        bgcolor:
          variant === 'admin' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0)',
        borderRadius: '6px'
      }}
      data-testid="JourneysTextResponse"
    />
  )
}
