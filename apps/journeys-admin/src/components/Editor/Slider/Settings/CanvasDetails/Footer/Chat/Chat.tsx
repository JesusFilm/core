import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { Accordion } from '../../Properties/Accordion'

import { ChatOption } from './ChatOption'

export function Chat(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const chatButtons = journey?.chatButtons ?? []
  const maxSelection = chatButtons.length >= 2
  const facebook = chatButtons.find(
    (button) => button.platform === MessagePlatform.facebook
  )
  const whatsApp = chatButtons.find(
    (button) => button.platform === MessagePlatform.whatsApp
  )
  const telegram = chatButtons.find(
    (button) => button.platform === MessagePlatform.telegram
  )
  const custom = chatButtons.find(
    (button) =>
      button.platform !== MessagePlatform.facebook &&
      button.platform !== MessagePlatform.whatsApp &&
      button.platform !== MessagePlatform.telegram
  )

  return (
    <Accordion
      id="chat platforms"
      icon={<MessageTyping />}
      name={t('Chat widget')}
    >
      <Box data-testid="Chat">
        <ChatOption
          title={t('Facebook Messenger')}
          chatButton={facebook}
          platform={MessagePlatform.facebook}
          active={facebook != null}
          journeyId={journey?.id}
          disableSelection={maxSelection}
        />
        <ChatOption
          chatButton={whatsApp}
          title={t('WhatsApp')}
          platform={MessagePlatform.whatsApp}
          active={whatsApp != null}
          journeyId={journey?.id}
          disableSelection={maxSelection}
        />
        <ChatOption
          chatButton={telegram}
          title={t('Telegram')}
          platform={MessagePlatform.telegram}
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
          <InformationCircleContainedIcon sx={{ mr: 3 }} />
          <Typography variant="caption">
            {t('You can add no more than two chat platforms')}
          </Typography>
        </Box>
      </Box>
    </Accordion>
  )
}
