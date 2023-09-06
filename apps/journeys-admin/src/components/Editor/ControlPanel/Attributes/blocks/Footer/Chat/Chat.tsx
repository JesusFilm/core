import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ChatPlatform } from '../../../../../../../../__generated__/globalTypes'

import { ChatOption } from './ChatOption'

export function Chat(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const chatButtons = journey?.chatButtons ?? []
  const maxSelection = chatButtons.length >= 2
  const facebook = chatButtons.find(
    (button) => button.platform === ChatPlatform.facebook
  )
  const whatsApp = chatButtons.find(
    (button) => button.platform === ChatPlatform.whatsApp
  )
  const telegram = chatButtons.find(
    (button) => button.platform === ChatPlatform.telegram
  )
  const custom = chatButtons.find(
    (button) =>
      button.platform !== ChatPlatform.facebook &&
      button.platform !== ChatPlatform.whatsApp &&
      button.platform !== ChatPlatform.telegram
  )

  return (
    <>
      <ChatOption
        title={t('Facebook Messenger')}
        chatButton={facebook}
        platform={ChatPlatform.facebook}
        active={facebook != null}
        journeyId={journey?.id}
        disableSelection={maxSelection}
      />
      <ChatOption
        chatButton={whatsApp}
        title={t('WhatsApp')}
        platform={ChatPlatform.whatsApp}
        active={whatsApp != null}
        journeyId={journey?.id}
        disableSelection={maxSelection}
      />
      <ChatOption
        chatButton={telegram}
        title={t('Telegram')}
        platform={ChatPlatform.telegram}
        active={telegram != null}
        journeyId={journey?.id}
        disableSelection={maxSelection}
      />
      <ChatOption
        chatButton={custom}
        title={t('Custom')}
        active={custom != null}
        journeyId={journey?.id}
        disableSelection={maxSelection}
        enableIconSelect
      />
      <Box
        sx={{
          display: maxSelection ? 'flex' : 'none',
          alignItems: 'center',
          px: 6,
          py: 2,
          mt: 5
        }}
      >
        <InfoOutlinedIcon sx={{ mr: 3 }} />
        <Typography variant="caption">
          {t('You can add no more than two chat platforms')}
        </Typography>
      </Box>
    </>
  )
}
