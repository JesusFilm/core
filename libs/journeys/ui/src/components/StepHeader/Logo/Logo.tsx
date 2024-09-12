import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import DiamondIcon from '@core/shared/ui/icons/Diamond'

import { useJourney } from '../../../libs/JourneyProvider'

export function Logo(): ReactElement {
  const { journey, variant } = useJourney()
  const router = useRouter()

  function handleHomeClick(): void {
    const homeSlug = router.query.journeySlug as string
    if (homeSlug != null) {
      void router.push(`/${homeSlug}`)
    }
  }

  const logo = journey?.logoImageBlock
  const showLogo = logo?.src != null
  const showEmpty = !showLogo && variant !== 'admin'

  const children: ReactNode = showLogo ? (
    <Box
      component="img"
      src={logo.src ?? ''}
      alt={logo.alt}
      onClick={handleHomeClick}
      sx={{
        width: 44,
        height: 44,
        objectFit: 'contain'
      }}
    />
  ) : showEmpty ? (
    <Box
      data-testid="empty-logo"
      sx={{
        width: 44,
        height: 44
      }}
    />
  ) : (
    <IconButton
      key="default"
      disabled
      sx={{
        height: 44,
        width: 44,
        outline: 'none',
        border: '3px dashed ',
        opacity: 0.5,
        borderColor: (theme) => theme.palette.grey[700]
      }}
    >
      <DiamondIcon sx={{ color: (theme) => theme.palette.grey[700] }} />
    </IconButton>
  )

  return children
}
