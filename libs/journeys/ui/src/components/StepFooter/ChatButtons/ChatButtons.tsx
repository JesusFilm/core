import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { ChatPlatform } from '../../../../__generated__/globalTypes'
import { useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { JourneyFields_chatButtons as ChatButton } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { getJourneyRTL } from '../../../libs/rtl'

import { ChatButtonEventCreate } from './__generated__/ChatButtonEventCreate'
import { BaseChatButton } from './BaseChatButton'
import { ChatButtonIcon } from './ChatButtonIcon'
import { FBWidgetButton } from './FBWidgetButton'

export const CHAT_BUTTON_EVENT_CREATE = gql`
  mutation ChatButtonEventCreate($input: ChatOpenEventCreateInput!) {
    chatOpenEventCreate(input: $input) {
      id
    }
  }
`

export function ChatButtons(): ReactElement {
  const { variant, journey } = useJourney()
  const { blockHistory } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]
  const { rtl } = getJourneyRTL(journey)
  const chatButtons = journey?.chatButtons

  const [chatButtonEventCreate] = useMutation<ChatButtonEventCreate>(
    CHAT_BUTTON_EVENT_CREATE
  )

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

  const renderButton = (
    chatButton: ChatButton,
    index: number
  ): ReactElement => {
    if (
      chatButton.platform === ChatPlatform.facebook
      // chatButton?.type === 'script'
    ) {
      return <FBWidgetButton {...chatButton} primary={index === 0} />
    }

    return (
      <BaseChatButton
        primary={index === 0}
        onClick={() => handleClick(chatButton)}
      >
        <ChatButtonIcon primary={index === 0} platform={chatButton.platform} />
      </BaseChatButton>
    )
  }

  return (
    <Stack
      data-testid="StepFooterChatButtons"
      direction={rtl ? 'row' : 'row-reverse'}
      gap={2}
    >
      {chatButtons?.map(renderButton)}
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
