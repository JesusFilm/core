import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import { InformationButton } from './InformationButton'
import { PaginationBullets } from './PaginationBullets'

interface StepHeaderProps {
  sx?: SxProps
}

export function StepHeader({ sx }: StepHeaderProps): ReactElement {
  return (
    <Stack
      data-testid="JourneysStepHeader"
      sx={{
        position: { xs: 'absolute', lg: 'relative' },
        mt: { xs: 1, lg: 0 },
        height: { lg: 44 },
        zIndex: 1,
        top: 0,
        alignItems: 'flex-end',
        width: { xs: '100%', lg: 'auto' },
        ...sx
      }}
    >
      <PaginationBullets />
      <InformationButton />
    </Stack>
  )
}
