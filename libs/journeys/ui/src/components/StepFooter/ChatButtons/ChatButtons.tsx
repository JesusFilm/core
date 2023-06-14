import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import Plus2 from '@core/shared/ui/icons/Plus2'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '../../../libs/JourneyProvider'
import { useBlocks } from '../../../libs/block'
import { JourneyFields_chatButtons as ChatButton } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { ChatPlatform } from '../../../../__generated__/globalTypes'
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
  const { admin, journey } = useJourney()
  const { activeBlock } = useBlocks()
  const chatButtons = journey?.chatButtons

  const [chatButtonEventCreate] = useMutation<ChatButtonEventCreate>(
    CHAT_BUTTON_EVENT_CREATE
  )

  const ChatIcon = ({ platform, index }: ChatIconProps): ReactElement => {
    // TODO: update with right icons
    switch (platform) {
      default:
        return (
          <MessageTyping
            sx={{
              color: (theme) =>
                index === 0 ? theme.palette.grey[900] : theme.palette.grey[100]
            }}
          />
        )
    }
  }

  const handleClick = (chatButton: ChatButton): void => {
    if (!admin && chatButton.link != null) {
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

  return (
    <Stack direction="row-reverse" gap={3}>
      {chatButtons?.map((chatButton, index) => (
        <IconButton
          key={chatButton?.id}
          onClick={() => handleClick(chatButton)}
          sx={{
            height: 44,
            width: 44,
            backgroundColor: (theme) =>
              index === 0 ? theme.palette.grey[100] : theme.palette.grey[700],
            '&:hover': {
              backgroundColor: (theme) =>
                index === 0 ? theme.palette.grey[100] : theme.palette.grey[700]
            }
          }}
        >
          {chatButton?.platform != null && (
            <ChatIcon platform={chatButton.platform} index={index} />
          )}
        </IconButton>
      ))}
      {admin && chatButtons?.length === 0 && (
        <IconButton
          key="default"
          sx={{
            height: 44,
            width: 44,
            outline: 'none',
            border: '3px dashed #6D6D7D'
          }}
        >
          <Plus2 sx={{ color: 'secondary.dark' }} />
        </IconButton>
      )}
    </Stack>
  )
}
