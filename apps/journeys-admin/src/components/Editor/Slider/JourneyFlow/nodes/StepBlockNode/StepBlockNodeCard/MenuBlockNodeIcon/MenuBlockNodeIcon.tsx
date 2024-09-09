import { getMenuIcon } from '@core/journeys/ui/StepHeader/utils/getMenuIcon'
import Box from '@mui/material/Box'
import { JourneyMenuButtonIcon } from 'libs/journeys/ui/__generated__/globalTypes'
import { ReactElement } from 'react'

export function MenuBlockNodeIcon({
  icon
}: {
  icon: JourneyMenuButtonIcon
}): ReactElement {
  const Icon = getMenuIcon(icon)

  return (
    <Box
      sx={{
        borderRadius: 20,
        height: 30,
        width: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'background.paper',
        background: 'linear-gradient(to bottom, #4c9bf8, #1873de)'
      }}
    >
      <Icon fontSize="small" />
    </Box>
  )
}
