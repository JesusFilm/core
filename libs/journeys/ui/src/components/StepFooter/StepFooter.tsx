import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'

import { ReactElement } from 'react'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { HostTitleLocation } from './HostTitleLocation'
import { HostAvatars } from './HostAvatars'

interface StepFooterProps {
  onFooterClick?: () => void
  sx?: SxProps
}

export function StepFooter({
  onFooterClick,
  sx
}: StepFooterProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  return (
    <Box
      data-testid="stepFooter"
      className="swiper-no-swiping"
      sx={{
        position: { xs: 'absolute', lg: 'relative' },
        zIndex: 1,
        bottom: 0,
        width: { xs: '100%', lg: 'auto' },
        ...sx
      }}
      onClick={(e) => {
        if (onFooterClick != null) {
          e.stopPropagation()
          onFooterClick()
        }
      }}
    >
      <Stack
        justifyContent="space-between"
        sx={{
          px: { xs: 6, lg: 6 },
          py: { xs: 2, lg: 2 },
          flexDirection: { lg: rtl ? 'row-reverse' : 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' }
        }}
      >
        {/* <Stack
          data-testid="chip"
          sx={{
            display: { xs: 'flex', lg: 'none' },
            width: 24,
            height: 16,
            borderRadius: 5,
            backgroundColor: 'white'
          }}
        /> */}
        <Stack
          sx={{
            flexGrow: 1,
            width: '100%',
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center'
          }}
          gap={4}
        >
          <Stack
            sx={{
              width: '100%',
              minWidth: 0,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            gap={2}
          >
            <HostAvatars />
            <Stack sx={{ py: 1.5, flex: '1 1 100%', minWidth: 0 }}>
              <Typography
                sx={{
                  zIndex: 1,
                  // Always dark mode on lg breakpoint
                  color: { xs: 'primary.main', lg: 'white' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {journey?.seoTitle ?? journey?.title}
              </Typography>
              <HostTitleLocation />
            </Stack>
            {/* <Stack
              data-testid="chip"
              sx={{
                display: { xs: 'none', lg: 'flex' },
                width: 24,
                height: 16,
                borderRadius: 5,
                backgroundColor: 'white'
              }}
            /> */}
          </Stack>
          <Box>
            <Stack
              data-testid="chat-widget"
              sx={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'white'
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
