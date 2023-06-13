import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import AddSquare4 from '@core/shared/ui/icons/AddSquare4'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '../../../libs/JourneyProvider'
import { useBlocks } from '../../../libs/block'
import { ChatButtonEventCreate } from './__generated__/ChatButtonEventCreate'

export const CHAT_BUTTON_EVENT_CREATE = gql`
  mutation ChatButtonEventCreate($input: ChatOpenEventCreateInput!) {
    chatOpenEventCreate(input: $input) {
      id
    }
  }
`

// remove once backend changes are in
interface ChatButton {
  id: string
  link: string
  platform: string
}

export function ChatButtons(): ReactElement {
  const { admin } = useJourney()
  const { activeBlock } = useBlocks()

  const [chatButtonEventCreate] = useMutation<ChatButtonEventCreate>(
    CHAT_BUTTON_EVENT_CREATE
  )

  // update to be using journeys.chatButtons
  const chatButtons: ChatButton[] = [
    { id: '1', link: 'https://m.me/', platform: 'facebook' },
    { id: '2', link: 'https://google.com', platform: 'facebook' }
  ]

  const handleClick = (chatButton: ChatButton): void => {
    if (!admin) {
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

  // TODO:
  // add unit tests
  // fix chat going out of card issue

  return (
    <Stack direction="row-reverse" gap={3}>
      {chatButtons.map((chatButton, index) => (
        <IconButton
          key={chatButton?.id}
          onClick={() => handleClick(chatButton)}
          sx={{
            backgroundColor: (theme) =>
              index === 0 ? theme.palette.grey[100] : theme.palette.grey[700],
            '&:hover': {
              backgroundColor: (theme) =>
                index === 0 ? theme.palette.grey[100] : theme.palette.grey[700]
            }
          }}
        >
          <MessageTyping
            sx={{
              color: (theme) =>
                index === 0 ? theme.palette.grey[900] : theme.palette.grey[100]
            }}
          />
        </IconButton>
      ))}
      {admin && chatButtons.length === 0 && (
        <IconButton key="default">
          <AddSquare4 sx={{ color: 'secondary.dark' }} />
        </IconButton>
      )}
    </Stack>
  )
}
