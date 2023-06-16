import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ChatPlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../__generated__/JourneyFields'
import { ChatOption } from './ChatOption'

// TODO: remove label from icon select
// TODO: update default icon
// TODO: catch mutation errors
// TODO: add cache updates

export function Chat(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const chatButtons = journey?.chatButtons ?? []
  const maxSelection = chatButtons.length >= 2

  let facebook: ChatButton | undefined
  let whatsApp: ChatButton | undefined
  let telegram: ChatButton | undefined
  let custom: ChatButton | undefined

  chatButtons.forEach((button) => {
    switch (button.platform) {
      case ChatPlatform.facebook:
        facebook = button
        break
      case ChatPlatform.whatsApp:
        whatsApp = button
        break
      case ChatPlatform.telegram:
        telegram = button
        break
      default:
        custom = button
    }
  })

  return (
    <>
      <ChatOption
        title={t('Facebook Messenger')}
        chatButton={facebook}
        platform={ChatPlatform.facebook}
        active={facebook != null}
        helperInfo={t(
          'A text block containing a with information on how the user can extract the correct link to Messenger chat.'
        )}
        journeyId={journey?.id}
        disableSelection={maxSelection}
      />
      <ChatOption
        chatButton={whatsApp}
        title={t('WhatsApp')}
        platform={ChatPlatform.whatsApp}
        active={whatsApp != null}
        helperInfo={t(
          'A text block containing a link with information on how the user can extract the correct link to WhatsApp chat.'
        )}
        journeyId={journey?.id}
        disableSelection={maxSelection}
      />
      <ChatOption
        chatButton={telegram}
        title={t('Telegram')}
        platform={ChatPlatform.telegram}
        active={telegram != null}
        helperInfo={t(
          'A text block containing a link with information on how the user can extract the correct link to Telegram chat.'
        )}
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
