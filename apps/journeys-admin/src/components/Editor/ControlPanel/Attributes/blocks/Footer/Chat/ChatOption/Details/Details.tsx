import { gql, useMutation } from '@apollo/client'
import AccordionDetails from '@mui/material/AccordionDetails'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Instagram from '@core/shared/ui/icons/Instagram'
import Line from '@core/shared/ui/icons/Line'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import Skype from '@core/shared/ui/icons/Skype'
import Snapchat from '@core/shared/ui/icons/Snapchat'
import Tiktok from '@core/shared/ui/icons/Tiktok'
import Viber from '@core/shared/ui/icons/Viber'
import Vk from '@core/shared/ui/icons/Vk'

import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonUpdate } from '../../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

export const JOURNEY_CHAT_BUTTON_UPDATE = gql`
  mutation JourneyChatButtonUpdate(
    $chatButtonUpdateId: ID!
    $journeyId: ID!
    $input: ChatButtonUpdateInput!
  ) {
    chatButtonUpdate(
      id: $chatButtonUpdateId
      journeyId: $journeyId
      input: $input
    ) {
      id
      link
      platform
    }
  }
`

interface Props {
  journeyId?: string
  chatButtonId?: string
  currentPlatform: ChatPlatform
  currentLink: string
  setCurrentPlatform: (value: ChatPlatform) => void
  setCurrentLink: (value: string) => void
  helperInfo?: string
  enableIconSelect: boolean
}

interface ChatPlatformOptions {
  value: ChatPlatform
  label: string
  icon: ReactElement
}

export function Details({
  journeyId,
  chatButtonId,
  currentPlatform,
  currentLink,
  setCurrentPlatform,
  setCurrentLink,
  helperInfo,
  enableIconSelect
}: Props): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyChatButtonUpdate] = useMutation<JourneyChatButtonUpdate>(
    JOURNEY_CHAT_BUTTON_UPDATE
  )

  const chatPlatformOptions: ChatPlatformOptions[] = [
    {
      value: ChatPlatform.custom,
      label: t('Chat'),
      icon: <MessageTyping />
    },
    {
      value: ChatPlatform.instagram,
      label: t('Instagram'),
      icon: <Instagram />
    },
    {
      value: ChatPlatform.line,
      label: t('LINE'),
      icon: <Line />
    },
    {
      value: ChatPlatform.skype,
      label: t('Skype'),
      icon: <Skype />
    },
    {
      value: ChatPlatform.snapchat,
      label: t('Snapchat'),
      icon: <Snapchat />
    },
    {
      value: ChatPlatform.tikTok,
      label: t('TikTok'),
      icon: <Tiktok />
    },
    {
      value: ChatPlatform.viber,
      label: t('Viber'),
      icon: <Viber />
    },
    {
      value: ChatPlatform.vk,
      label: t('VK'),
      icon: <Vk />
    }
  ]

  async function handleUpdate(
    type: 'link' | 'platform',
    value?: string
  ): Promise<void> {
    let input
    if (type === 'link') {
      input = {
        link: value,
        platform: currentPlatform
      }
      setCurrentLink(value ?? '')
    } else {
      input = {
        link: currentLink,
        platform: value as ChatPlatform
      }
      setCurrentPlatform(value as ChatPlatform)
    }

    if (chatButtonId == null) return
    const { data } = await journeyChatButtonUpdate({
      variables: {
        chatButtonUpdateId: chatButtonId,
        journeyId,
        input
      },
      optimisticResponse: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: chatButtonId,
          ...input
        }
      }
    })

    if (data != null) {
      enqueueSnackbar(t('Button updated.'), {
        variant: 'success',
        preventDuplicate: true
      })
    }
  }

  return (
    <AccordionDetails sx={{ px: 6 }}>
      <Stack direction="column" spacing={8} sx={{ pb: 4 }}>
        {enableIconSelect && (
          <FormControl variant="filled" fullWidth hiddenLabel>
            <Select
              labelId="icon-select"
              value={currentPlatform}
              displayEmpty
              onChange={async (event) =>
                await handleUpdate('platform', event.target.value)
              }
              IconComponent={ChevronDown}
            >
              {chatPlatformOptions.map(({ value, label, icon }) => (
                <MenuItem key={`chat-icon-${value}`} value={value}>
                  <Stack direction="row" spacing={5}>
                    {icon}
                    <Typography>{label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextFieldForm
          id={currentPlatform as string}
          label={t('Paste URL here')}
          initialValue={currentLink}
          onSubmit={async (value) => await handleUpdate('link', value)}
        />

        {helperInfo != null && (
          <Typography variant="caption">{helperInfo}</Typography>
        )}
      </Stack>
    </AccordionDetails>
  )
}
