import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Instagram from '@core/shared/ui/icons/Instagram'
import Viber from '@core/shared/ui/icons/Viber'
import Vk from '@core/shared/ui/icons/Vk'
import Snapchat from '@core/shared/ui/icons/Snapchat'
import Skype from '@core/shared/ui/icons/Skype'
import Line from '@core/shared/ui/icons/Line'
import Tiktok from '@core/shared/ui/icons/Tiktok'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import { JourneyChatButtonUpdate } from '../../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'
import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'

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
  currentPlatform: ChatPlatform | 'default'
  currentLink: string
  setCurrentPlatform: (value: ChatPlatform | 'default') => void
  setCurrentLink: (value: string) => void
  helperInfo?: string
  enableIconSelect: boolean
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

  const chatIconOptions = [
    {
      value: 'default',
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
    value?: string | ChatPlatform
  ): Promise<void> {
    let input
    if (type === 'link') {
      input = {
        link: value as string,
        platform: currentPlatform
      }
      setCurrentLink(value as string)
    } else {
      input = {
        link: currentLink,
        platform: value !== 'default' ? (value as ChatPlatform) : null
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
              IconComponent={KeyboardArrowDownRoundedIcon}
            >
              {chatIconOptions.map(({ value, label, icon }) => (
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
          label={t('Paste URL here')}
          initialValues={currentLink}
          handleSubmit={async (value) => await handleUpdate('link', value)}
        />

        {helperInfo != null && (
          <Typography variant="caption">{helperInfo}</Typography>
        )}
      </Stack>
    </AccordionDetails>
  )
}
