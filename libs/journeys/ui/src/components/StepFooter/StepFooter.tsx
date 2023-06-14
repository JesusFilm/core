import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { NameAndLocation } from './NameAndLocation'
import { HostAvatars } from './HostAvatars/HostAvatars'

export function StepFooter(): ReactElement {
  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const name = 'Bartholomew & Bernadette'
  const location = 'Karaganda is a very long city name'

  const src1 = undefined
  const src2 = undefined
  return (
    <Box
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
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <HostAvatars src1={src1} src2={src2} admin={admin} />
            <Typography
              sx={{
                zIndex: 1,
                py: 3,
                // Always dark mode on lg breakpoint
                color: { xs: 'primary.main', lg: 'white' },
                width: {
                  xs: `calc(100vw - ${
                    !admin && (src1 == null || src2 == null)
                      ? '102px'
                      : !admin && src1 != null && src2 != null
                      ? '132px'
                      : (src1 != null || src2 != null) && admin
                      ? '132px'
                      : '102px'
                  })`,
                  lg: `calc(100vw - ${
                    !admin && src1 != null && src2 != null ? '190px' : '160px'
                  } )`
                },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {journey?.seoTitle ?? journey?.title}
              <NameAndLocation
                name={name}
                location={location}
                rtl={rtl}
                src1={src1}
                src2={src2}
                admin={admin}
              />
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
