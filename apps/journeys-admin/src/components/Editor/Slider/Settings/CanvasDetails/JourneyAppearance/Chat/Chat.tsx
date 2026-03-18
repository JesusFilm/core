import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'

import { MessagePlatform } from '../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonCreate } from '../../../../../../../../__generated__/JourneyChatButtonCreate'
import { Accordion } from '../../Properties/Accordion'

import { ChatOption } from './ChatOption'
import { JOURNEY_CHAT_BUTTON_CREATE } from './ChatOption/Summary/Summary'

export function Chat(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [chatButtonCreate] = useMutation<JourneyChatButtonCreate>(
    JOURNEY_CHAT_BUTTON_CREATE
  )

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
  const customButtons = chatButtons.filter(
    (button) =>
      button.platform !== MessagePlatform.facebook &&
      button.platform !== MessagePlatform.whatsApp &&
      button.platform !== MessagePlatform.telegram
  )

  async function handleAddCustomButton(): Promise<void> {
    if (journey?.id == null) return
    await chatButtonCreate({
      variables: {
        journeyId: journey.id,
        input: {
          link: '',
          platform: MessagePlatform.custom
        }
      },
      update(cache, { data }) {
        if (data?.chatButtonCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              chatButtons(existing = []) {
                const ref = cache.writeFragment({
                  data: data.chatButtonCreate,
                  fragment: gql`
                    fragment NewChatButton on ChatButton {
                      id
                    }
                  `
                })
                return [...existing, ref]
              }
            }
          })
        }
      }
    })
  }

  return (
    <Accordion
      id="chat platforms"
      icon={<MessageTyping />}
      name={t('Chat Widget')}
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
          key={customButtons[0]?.id ?? 'custom-0'}
          chatButton={customButtons[0]}
          title={t('Custom')}
          active={customButtons[0] != null}
          journeyId={journey?.id}
          disableSelection={maxSelection}
          enableIconSelect
        />
        {customButtons.length === 2 && (
          <ChatOption
            chatButton={customButtons[1]}
            title={t('Custom')}
            active
            journeyId={journey?.id}
            disableSelection={maxSelection}
            enableIconSelect
          />
        )}
        {customButtons.length === 1 && !maxSelection && (
          <Button
            variant="text"
            size="small"
            sx={{ mx: 6, my: 1 }}
            onClick={handleAddCustomButton}
          >
            {t('+ Add 2nd Custom Button')}
          </Button>
        )}
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
