import { styled } from '@mui/material/styles'
import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'
import Share from '@core/shared/ui/CustomIcon/outlined/Share'
import Like from '@core/shared/ui/CustomIcon/outlined/Like'
import ThumbsDown from '@core/shared/ui/CustomIcon/outlined/ThumbsDown'

interface StepFooterProps {
  block: TreeBlock
}

const StyledChip = styled(Chip)(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    color: theme.palette.common.white,
    backgroundColor: `${theme.palette.grey[50]}26`
  }
}))

export default function StepFooter({ block }: StepFooterProps): ReactElement {
  const { journey } = useJourney()

  const card =
    block.children.length > 0 && block.children[0].__typename === 'CardBlock'
      ? block.children[0]
      : undefined

  const cardTheme = {
    themeName: card?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark
  }

  const contentColorProps = {
    xs: 'primary.main',
    lg:
      cardTheme.themeMode === ThemeMode.dark
        ? 'primary.main'
        : 'primary.contrastText'
  }

  const shareJourney = async (): Promise<void> => {
    console.log(navigator.share, navigator.canShare())
    if (navigator.share != null && navigator.canShare() === true) {
      await navigator.share({
        title: journey?.seoTitle ?? '',
        url: `https://your.nextstep.is/journeys/${journey?.slug ?? ''}`
      })
    } else {
      console.log("can't share")
    }
  }

  return (
    <ThemeProvider {...cardTheme}>
      <Stack
        sx={{
          width: { xs: '100%', lg: 'unset' },
          px: { xs: 4, lg: 6 },
          mt: { xs: 2, lg: 0 },
          position: { xs: 'absolute', lg: 'relative' },
          zIndex: 1,
          bottom: 0,
          flexDirection: { xs: 'column', lg: 'row-reverse' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' }
        }}
      >
        {/* <Stack className="swiper-no-swiping" direction="row" spacing={3}>
          <StyledChip
            label="Share"
            icon={<Share fontSize="small" />}
            sx={{
              pl: 1.5,
              '.MuiChip-icon': {
                color: contentColorProps
              }
            }}
            onClick={shareJourney}
          />
          <StyledChip
            label=""
            icon={<Like fontSize="small" />}
            sx={{
              '.MuiChip-icon': {
                color: contentColorProps,
                ml: 3.5,
                mr: -2.5
              }
            }}
          />
          <StyledChip
            label=""
            icon={<ThumbsDown fontSize="small" />}
            sx={{
              '.MuiChip-icon': {
                color: contentColorProps,
                ml: 3.5,
                mr: -2.5
              }
            }}
          />
        </Stack> */}
        <Typography
          className="swiper-no-swiping"
          color={contentColorProps}
          sx={{ zIndex: 1, py: 3 }}
        >
          {journey?.title}
        </Typography>
      </Stack>
    </ThemeProvider>
  )
}
