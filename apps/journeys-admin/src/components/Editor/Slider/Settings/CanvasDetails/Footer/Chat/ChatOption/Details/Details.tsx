import { gql, useMutation } from '@apollo/client'
import AccordionDetails from '@mui/material/AccordionDetails'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import InstagramIcon from '@core/shared/ui/icons/Instagram'
import LineIcon from '@core/shared/ui/icons/Line'
import MessageTypingIcon from '@core/shared/ui/icons/MessageTyping'
import SkypeIcon from '@core/shared/ui/icons/Skype'
import SnapchatIcon from '@core/shared/ui/icons/Snapchat'
import TiktokIcon from '@core/shared/ui/icons/Tiktok'
import ViberIcon from '@core/shared/ui/icons/Viber'
import VkIcon from '@core/shared/ui/icons/Vk'

import { JourneyChatButtonUpdate } from '../../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'
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

interface DetailsProps {
  journeyId?: string
  chatButtonId?: string
  currentPlatform: MessagePlatform
  currentLink: string
  setCurrentPlatform: (value: MessagePlatform) => void
  setCurrentLink: (value: string) => void
  helperInfo?: string
  enableIconSelect: boolean
}

interface MessagePlatformOptions {
  value: MessagePlatform
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
}: DetailsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyChatButtonUpdate] = useMutation<JourneyChatButtonUpdate>(
    JOURNEY_CHAT_BUTTON_UPDATE
  )

  const messagePlatformOptions: MessagePlatformOptions[] = [
    {
      value: MessagePlatform.custom,
      label: t('Chat'),
      icon: <MessageTypingIcon />
    },
    {
      value: MessagePlatform.instagram,
      label: t('Instagram'),
      icon: <InstagramIcon />
    },
    {
      value: MessagePlatform.line,
      label: t('LINE'),
      icon: <LineIcon />
    },
    {
      value: MessagePlatform.skype,
      label: t('Skype'),
      icon: <SkypeIcon />
    },
    {
      value: MessagePlatform.snapchat,
      label: t('Snapchat'),
      icon: <SnapchatIcon />
    },
    {
      value: MessagePlatform.tikTok,
      label: t('TikTok'),
      icon: <TiktokIcon />
    },
    {
      value: MessagePlatform.viber,
      label: t('Viber'),
      icon: <ViberIcon />
    },
    {
      value: MessagePlatform.vk,
      label: t('VK'),
      icon: <VkIcon />
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
        platform: value as MessagePlatform
      }
      setCurrentPlatform(value as MessagePlatform)
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
    <AccordionDetails sx={{ px: 6 }} data-testid="ChatOptionDetails">
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
              IconComponent={ChevronDownIcon}
            >
              {messagePlatformOptions.map(({ value, label, icon }) => (
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
