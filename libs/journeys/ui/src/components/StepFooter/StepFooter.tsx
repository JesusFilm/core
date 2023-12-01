import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'

import { ChatButtons } from './ChatButtons'
import { FooterButtonList } from './FooterButtonList'
import { HostAvatars } from './HostAvatars'
import { HostTitleLocation } from './HostTitleLocation'

interface StepFooterProps {
  onFooterClick?: () => void
  sx?: SxProps
  title?: string
}

export function StepFooter({
  onFooterClick,
  sx,
  title
}: StepFooterProps): ReactElement {
  const { journey, variant } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const hasAvatar =
    variant === 'admin' ||
    journey?.host?.src1 != null ||
    journey?.host?.src2 != null

  const hasChatWidget =
    variant === 'admin' ||
    (journey?.chatButtons != null && journey?.chatButtons.length > 0)

  return (
    <Box
      data-testid="JourneysStepFooter"
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
        spacing={2}
        sx={{
          px: { xs: 6, lg: 0 },
          py: { xs: 2, lg: 0 },
          pt: { xs: 3, sm: 0 },
          flexDirection: { lg: rtl ? 'row-reverse' : 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' }
        }}
      >
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <FooterButtonList />
        </Box>

        <Stack
          sx={{
            width: '100%',
            height: 52,
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
            {hasAvatar && <HostAvatars hasPlaceholder={variant === 'admin'} />}
            <Stack
              sx={{ py: 1.5, flex: '1 1 100%', minWidth: 0 }}
              spacing={-1.5}
            >
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
                {title != null ? title : journey?.seoTitle ?? journey?.title}
              </Typography>
              <HostTitleLocation />
            </Stack>

            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <FooterButtonList />
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
