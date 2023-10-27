import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'

import Facebook from '@core/shared/ui/icons/Facebook'
import Instagram from '@core/shared/ui/icons/Instagram'
import Line from '@core/shared/ui/icons/Line'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import Plus2 from '@core/shared/ui/icons/Plus2'
import Skype from '@core/shared/ui/icons/Skype'
import Snapchat from '@core/shared/ui/icons/Snapchat'
import Telegram from '@core/shared/ui/icons/Telegram'
import Tiktok from '@core/shared/ui/icons/Tiktok'
import Viber from '@core/shared/ui/icons/Viber'
import Vk from '@core/shared/ui/icons/Vk'
import WhatsApp from '@core/shared/ui/icons/WhatsApp'

import { ChatPlatform } from '../../../../__generated__/globalTypes'
import { useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { JourneyFields_chatButtons as ChatButton } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { getJourneyRTL } from '../../../libs/rtl'

import { ChatButtonEventCreate } from './__generated__/ChatButtonEventCreate'

export const CHAT_BUTTON_EVENT_CREATE = gql`
  mutation ChatButtonEventCreate($input: ChatOpenEventCreateInput!) {
    chatOpenEventCreate(input: $input) {
      id
    }
  }
`

interface ChatIconProps {
  platform: ChatPlatform
  index: number
}

export function ChatButtons(): ReactElement {
  const { variant, journey } = useJourney()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const theme = useTheme()
  const { rtl } = getJourneyRTL(journey)
  const chatButtons = journey?.chatButtons

  const [chatButtonEventCreate] = useMutation<ChatButtonEventCreate>(
    CHAT_BUTTON_EVENT_CREATE
  )

  const getColor = (
    primary: boolean,
    type: 'main' | 'background' = 'main'
  ): string | undefined => {
    if (type === 'background') {
      return primary ? theme.palette.grey[100] : '#dedfe026'
    }
    if (type === 'main') {
      return primary ? theme.palette.grey[900] : theme.palette.grey[100]
    }
  }

  const handleClick = (chatButton: ChatButton): void => {
    if (
      (variant === 'default' || variant === 'embed') &&
      chatButton.link != null
    ) {
      window.open(chatButton.link, '_blank')
      void chatButtonEventCreate({
        variables: {
          input: {
            id: chatButton?.id,
            blockId: activeBlock?.id,
            stepId: activeBlock?.id,
            value: chatButton?.platform
          }
        }
      })
    }
  }

  const ChatIcon = ({ platform, index }: ChatIconProps): ReactElement => {
    const platformComponents = {
      facebook: Facebook,
      telegram: Telegram,
      whatsApp: WhatsApp,
      instagram: Instagram,
      viber: Viber,
      vk: Vk,
      snapchat: Snapchat,
      skype: Skype,
      line: Line,
      tikTok: Tiktok,
      custom: MessageTyping
    }

    const IconComponent = platformComponents[platform]
    return <IconComponent sx={{ color: getColor(index === 0, 'main') }} />
  }

  return (
    <Stack
      data-testid="StepFooterChatButtons"
      direction={rtl ? 'row' : 'row-reverse'}
      gap={2}
    >
      {chatButtons?.map((chatButton, index) => (
        <IconButton
          key={chatButton?.id}
          onClick={() => handleClick(chatButton)}
          sx={{
            height: 44,
            width: 44,
            backgroundColor: getColor(index === 0, 'background'),
            '&:hover': {
              backgroundColor: getColor(index === 0, 'background')
            }
          }}
        >
          <ChatIcon
            platform={chatButton.platform ?? ChatPlatform.custom}
            index={index}
          />
        </IconButton>
      ))}
      {variant === 'admin' && chatButtons?.length === 0 && (
        <IconButton
          key="default"
          disabled
          sx={{
            height: 44,
            width: 44,
            outline: 'none',
            border: '3px dashed ',
            opacity: 0.5,
            borderColor: (theme) => theme.palette.grey[700]
          }}
        >
          <Plus2 sx={{ color: (theme) => theme.palette.grey[700] }} />
        </IconButton>
      )}
    </Stack>
  )
}
