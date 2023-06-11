import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ReactElement } from 'react'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { NameAndLocation } from './NameAndLocation'

export function StepFooter(): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const name = 'Alexander & Eliza Hamilton'
  const location = 'New York Harbour'

  return (
    <Box
      className="swiper-no-swiping"
      sx={{
        position: { xs: 'absolute', lg: 'relative' },
        zIndex: 1,
        bottom: 0,
        width: { xs: '100%', lg: 'auto' }
      }}
    >
      <Stack
        justifyContent="space-between"
        sx={{
          px: { xs: 4, lg: 6 },
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
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflow: 'clip'
            }}
          >
            <Typography
              sx={{
                zIndex: 1,
                py: 3,
                // Always dark mode on lg breakpoint
                color: { xs: 'primary.main', lg: 'white' }
              }}
            >
              {journey?.seoTitle ?? journey?.title}
              <NameAndLocation name={name} location={location} rtl={rtl} />
            </Typography>

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
          {/* <Stack
            data-testid="chat-widget"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 5,
              backgroundColor: 'white'
            }}
          /> */}
        </Stack>
      </Stack>
    </Box>
  )
}
