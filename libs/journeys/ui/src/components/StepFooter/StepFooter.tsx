import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { AiChatButton } from '../AiChatButton'
import {
  getFooterMobileHeight,
  getTitle,
  hasChatWidget,
  hasCombinedFooter,
  hasHostAvatar,
  hasHostDetails
} from '../Card/utils/getFooterElements'
import { InformationButton } from '../StepHeader/InformationButton'

import { ChatButtons } from './ChatButtons'
import { FooterButtonList } from './FooterButtonList'
import { HostAvatars } from './HostAvatars'
import { HostTitleLocation } from './HostTitleLocation'
import { AiChatButton } from '../AiChatButton'

interface StepFooterProps {
  onFooterClick?: () => void
  sx?: SxProps
}

export function StepFooter({
  onFooterClick,
  sx
}: StepFooterProps): ReactElement {
  const { journey, variant } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const hostAvatar = hasHostAvatar({ journey, variant })
  const hostDetails = hasHostDetails({ journey })
  const chat = hasChatWidget({ journey, variant })
  const title = getTitle({ journey })

  const footerMobileHeight = getFooterMobileHeight({ journey, variant })
  const combinedFooter = hasCombinedFooter({ journey, variant })

  const isWebsite = journey?.website === true

  function isInIframe(): boolean {
    try {
      return window.self !== window.top
    } catch {
      return true
    }
  }

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
          px: { xs: variant === 'default' ? 6 : 3, lg: 0 },
          py: { xs: 2, lg: 0 },

          flexDirection: { lg: rtl ? 'row-reverse' : 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
          width: '100%'
        }}
      >
        {!isWebsite && !combinedFooter && (
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <FooterButtonList />
          </Box>
        )}

        <Stack
          sx={{
            width: '100%',
            height: { xs: footerMobileHeight, sm: 52 },
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: isWebsite ? 'space-between' : undefined,
            mt: '0px !important'
          }}
          gap={4}
        >
          {!isWebsite && combinedFooter && (
            <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
              <FooterButtonList />
            </Box>
          )}
          {isWebsite && <InformationButton sx={{ p: 0 }} />}
          {!isWebsite && (
            <Stack
              sx={{
                width: '100%',
                minWidth: 0,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              gap={2}
            >
              {hostAvatar && (
                <HostAvatars
                  hasPlaceholder={variant === 'admin'}
                  avatarSrc1={journey?.host?.src1}
                  avatarSrc2={journey?.host?.src2}
                />
              )}
              {(title != null || hostDetails) && (
                <Stack sx={{ flex: '1 1 100%', minWidth: 0 }}>
                  {title != null && (
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
                      {title}
                    </Typography>
                  )}
                  {hostDetails && <HostTitleLocation />}
                </Stack>
              )}

              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <FooterButtonList />
              </Box>
            </Stack>
          )}

          <Box>
            {chat && <ChatButtons />}
            {!isInIframe() && <AiChatButton />}
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
