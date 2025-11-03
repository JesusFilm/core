import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import CheckBroken from '@core/shared/ui/icons/CheckBroken'
import CheckContained from '@core/shared/ui/icons/CheckContained'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import Globe2 from '@core/shared/ui/icons/Globe2'
import Globe3 from '@core/shared/ui/icons/Globe3'
import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import HelpSquareContained from '@core/shared/ui/icons/HelpSquareContained'
import Home3 from '@core/shared/ui/icons/Home3'
import Home4 from '@core/shared/ui/icons/Home4'
import InstagramIcon from '@core/shared/ui/icons/Instagram'
import KakaoTalk from '@core/shared/ui/icons/KakaoTalk'
import LineIcon from '@core/shared/ui/icons/Line'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import Mail1 from '@core/shared/ui/icons/Mail1'
import Menu1 from '@core/shared/ui/icons/Menu1'
import MessageChat2 from '@core/shared/ui/icons/MessageChat2'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import MessageNotifyCircle from '@core/shared/ui/icons/MessageNotifyCircle'
import MessageNotifySquare from '@core/shared/ui/icons/MessageNotifySquare'
import MessageSquare from '@core/shared/ui/icons/MessageSquare'
import MessageText1 from '@core/shared/ui/icons/MessageText1'
import MessageText2 from '@core/shared/ui/icons/MessageText2'
import MessageTypingIcon from '@core/shared/ui/icons/MessageTyping'
import Send1 from '@core/shared/ui/icons/Send1'
import Send2 from '@core/shared/ui/icons/Send2'
import Settings from '@core/shared/ui/icons/Settings'
import ShieldCheck from '@core/shared/ui/icons/ShieldCheck'
import SkypeIcon from '@core/shared/ui/icons/Skype'
import SnapchatIcon from '@core/shared/ui/icons/Snapchat'
import TiktokIcon from '@core/shared/ui/icons/Tiktok'
import ViberIcon from '@core/shared/ui/icons/Viber'
import VkIcon from '@core/shared/ui/icons/Vk'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'
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
      value: MessagePlatform.kakaoTalk,
      label: t('KakaoTalk'),
      icon: <KakaoTalk />
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
    },
    {
      value: MessagePlatform.globe2,
      label: t('Globe 1'),
      icon: <Globe2 />
    },
    {
      value: MessagePlatform.globe3,
      label: t('Globe 2'),
      icon: <Globe3 />
    },
    {
      value: MessagePlatform.messageText1,
      label: t('Message Text Circle'),
      icon: <MessageText1 />
    },
    {
      value: MessagePlatform.messageText2,
      label: t('Message Text Square'),
      icon: <MessageText2 />
    },
    {
      value: MessagePlatform.send1,
      label: t('Send 1'),
      icon: <Send1 />
    },
    {
      value: MessagePlatform.send2,
      label: t('Send 2'),
      icon: <Send2 />
    },
    {
      value: MessagePlatform.messageChat2,
      label: t('Message Chat Circle'),
      icon: <MessageChat2 />
    },
    {
      value: MessagePlatform.messageCircle,
      label: t('Message Circle'),
      icon: <MessageCircle />
    },
    {
      value: MessagePlatform.messageNotifyCircle,
      label: t('Message Notify Circle'),
      icon: <MessageNotifyCircle />
    },
    {
      value: MessagePlatform.messageNotifySquare,
      label: t('Message Notify Square'),
      icon: <MessageNotifySquare />
    },
    {
      value: MessagePlatform.messageSquare,
      label: t('Message Square'),
      icon: <MessageSquare />
    },
    {
      value: MessagePlatform.mail1,
      label: t('Mail'),
      icon: <Mail1 />
    },
    {
      value: MessagePlatform.linkExternal,
      label: t('Link External'),
      icon: <LinkExternal />
    },
    {
      value: MessagePlatform.home3,
      label: t('Home 1'),
      icon: <Home3 />
    },
    {
      value: MessagePlatform.home4,
      label: t('Home 2'),
      icon: <Home4 />
    },
    {
      value: MessagePlatform.helpCircleContained,
      label: t('Help Circle'),
      icon: <HelpCircleContained />
    },
    {
      value: MessagePlatform.helpSquareContained,
      label: t('Help Square'),
      icon: <HelpSquareContained />
    },
    {
      value: MessagePlatform.shieldCheck,
      label: t('Shield Check'),
      icon: <ShieldCheck />
    },
    {
      value: MessagePlatform.menu1,
      label: t('Menu'),
      icon: <Menu1 />
    },
    {
      value: MessagePlatform.checkBroken,
      label: t('Check Broken'),
      icon: <CheckBroken />
    },
    {
      value: MessagePlatform.checkContained,
      label: t('Check Contained'),
      icon: <CheckContained />
    },
    {
      value: MessagePlatform.settings,
      label: t('Settings'),
      icon: <Settings />
    }
  ]

  async function handleUpdate(
    type: 'link' | 'platform',
    value?: string
  ): Promise<void> {
    let input
    if (type === 'link') {
      const hasProtocolPrefix = /^\w+:\/\//
      const link =
        value === ''
          ? ''
          : hasProtocolPrefix.test(value ?? '')
            ? value
            : `https://${value}`

      input = {
        link,
        platform: currentPlatform
      }
      setCurrentLink(link ?? '')
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
    <Box sx={{ px: 6 }} data-testid="ChatOptionDetails">
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
    </Box>
  )
}
