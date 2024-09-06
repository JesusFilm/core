import { Box, IconButton } from '@mui/material'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Ellipsis from '@core/shared/ui/icons/Ellipsis'
import Grid1 from '@core/shared/ui/icons/Grid1'
import Home3 from '@core/shared/ui/icons/Home3'
import Home4 from '@core/shared/ui/icons/Home4'
import Menu1 from '@core/shared/ui/icons/Menu1'
import More from '@core/shared/ui/icons/More'

import { JourneyMenuButtonIcon } from '../../../__generated__/globalTypes'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'

import { InformationButton } from './InformationButton'
import { PaginationBullets } from './PaginationBullets'

function Menu(): ReactElement {
  const { journey, variant } = useJourney()

  const menuIcons = {
    [JourneyMenuButtonIcon.chevronDown]: <ChevronDown />,
    [JourneyMenuButtonIcon.ellipsis]: <Ellipsis />,
    // TODO: change this to correct icon
    [JourneyMenuButtonIcon.equals]: <Menu1 />,
    [JourneyMenuButtonIcon.grid1]: <Grid1 />,
    [JourneyMenuButtonIcon.home3]: <Home3 />,
    [JourneyMenuButtonIcon.home4]: <Home4 />,
    [JourneyMenuButtonIcon.menu1]: <Menu1 />,
    [JourneyMenuButtonIcon.more]: <More />
  }

  let Icon = variant === 'admin' ? menuIcons[JourneyMenuButtonIcon.menu1] : null

  if (journey != null && journey.menuButtonIcon != null) {
    Icon = menuIcons[journey.menuButtonIcon]
  }

  const router = useRouter()
  const handleClick = (): void => {
    alert('clicked menu')
    if (journey != null) {
      void router.push(`/${journey.id}/${journey?.menuStepBlockId}`)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 100,
        border:
          journey?.menuButtonIcon == null && variant === 'admin'
            ? 'dashed'
            : null,
        minHeight: 48,
        minWidth: 48,
        display: 'grid',
        placeItems: 'center'
      }}
      data-testid="Menu"
    >
      {variant === 'default' && journey?.menuStepBlockId != null ? (
        <IconButton onClick={handleClick}>{Icon}</IconButton>
      ) : (
        Icon
      )}
    </Box>
  )
}

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
        py: 4,
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
            px: { xs: 4, lg: 0 },
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
            {/* Logo */}
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
            <Menu />
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
