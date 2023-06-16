import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'

import { ReactElement } from 'react'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { NameAndLocation } from './NameAndLocation'
import { HostAvatars } from './HostAvatars/HostAvatars'

interface StepFooterProps {
  onFooterClick?: () => void
  sx?: SxProps
}

export function StepFooter({
  onFooterClick,
  sx
}: StepFooterProps): ReactElement {
  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const name = 'Alexander & Eliza Hamilton'
  const location = 'New York'

  const src1 = 'http://surl.li/iauzf'
  const src2 = undefined
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
        >
          <Stack
            sx={{
              flex: '1 1 100%',
              minWidth: 0,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-even'
            }}
          >
            <Box
              sx={{
                pr: 4,
                pl: rtl ? 6 : 0,
                mr:
                  (src1 != null || src2 != null) && rtl && admin
                    ? 4
                    : src1 != null && src2 != null && rtl && !admin
                    ? 4
                    : 0
              }}
            >
              <HostAvatars hasPlaceholder={admin} />
            </Box>
            <Typography
              sx={{
                zIndex: 1,
                py: 3,
                // Always dark mode on lg breakpoint
                color: { xs: 'primary.main', lg: 'white' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                order: 1
              }}
            >
              {journey?.seoTitle ?? journey?.title}
              <NameAndLocation name={name} location={location} />
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
