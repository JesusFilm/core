import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { HostTitleLocation } from './HostTitleLocation'
import { HostAvatars } from './HostAvatars'
import { ChatButtons } from './ChatButtons'
import { FooterButtons } from './FooterButtons'

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
  const { editableStepFooter } = useFlags()
  const hasAvatar =
    (admin && editableStepFooter) ||
    journey?.host?.src1 != null ||
    journey?.host?.src2 != null
  const hasChatWidget =
    admin || (journey?.chatButtons != null && journey?.chatButtons.length > 0)

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
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <FooterButtons />
        </Box>

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
            {hasAvatar && <HostAvatars />}
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

            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <FooterButtons />
            </Box>
          </Stack>
          {hasChatWidget && (
            <Box>
              <ChatButtons />
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
