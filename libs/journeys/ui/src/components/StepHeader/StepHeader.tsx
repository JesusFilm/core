import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import { useJourney } from '../../libs/JourneyProvider'

import { InformationButton } from './InformationButton'
import { PaginationBullets } from './PaginationBullets'

interface StepHeaderProps {
  onHeaderClick?: () => void
  sx?: SxProps
}

export function StepHeader({
  onHeaderClick,
  sx
}: StepHeaderProps): ReactElement {
  const { journey, variant } = useJourney()

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
      onClick={(e) => {
        if (onHeaderClick != null) {
          e.stopPropagation()
          onHeaderClick()
        }
      }}
    >
      {journey?.website === true ? (
        <>
          {/* Logo */}
          {/* Title */}
          {/* Menu */}
          <InformationButton />
        </>
      ) : (
        <>
          <PaginationBullets />
          {variant !== 'admin' && <InformationButton />}
        </>
      )}
    </Stack>
  )
}
