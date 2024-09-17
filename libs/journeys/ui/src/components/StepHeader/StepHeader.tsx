import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'

import { InformationButton } from './InformationButton'
import { Logo } from './Logo'
import { PaginationBullets } from './PaginationBullets'

interface StepHeaderProps {
  onHeaderClick?: () => void
  sx?: SxProps
}

export function StepHeader({
  onHeaderClick,
  sx
}: StepHeaderProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

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
        <Stack
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: { xs: 3, lg: 0 },
            flexDirection: { lg: rtl ? 'row-reverse' : 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            width: '100%'
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: 52,
              flexDirection: rtl ? 'row-reverse' : 'row',
              alignItems: 'center'
            }}
            gap={4}
          >
            <Logo />
            <Stack
              sx={{
                flex: '1 1 100%',
                minWidth: 0,
                alignItems: 'center'
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  zIndex: 1,
                  // Always dark mode on lg breakpoint
                  color: { xs: 'primary.main', lg: 'white' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {journey?.displayTitle ?? journey?.seoTitle}
              </Typography>
            </Stack>
            {/* Menu */}
          </Stack>
        </Stack>
      ) : (
        <>
          <PaginationBullets />
          <InformationButton />
        </>
      )}
    </Stack>
  )
}
