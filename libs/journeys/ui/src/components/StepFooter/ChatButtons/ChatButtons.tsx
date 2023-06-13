import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import AddSquare4 from '@core/shared/ui/icons/AddSquare4'
import { styled } from '@mui/material/styles'
import { gql, useMutation } from '@apollo/client'
import { useJourney } from '../../../libs/JourneyProvider'
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

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  '&:hover': {
    backgroundColor: theme.palette.grey[100]
  }
}))

export function ChatButtons(): ReactElement {
  const { admin } = useJourney()

  // const [chatButtonEventCreate] = useMutation<ChatButtonEventCreate>(
  //   CHAT_BUTTON_EVENT_CREATE
  // )

  // update to be using journeys.chatButtons
  const chatButtons: ChatButton[] = [
    { id: '1', link: 'm.me/user', platform: 'facebook' }
  ]

  const handleClick = (chatButton: ChatButton): void => {
    if (!admin) {
      window.open(chatButton.link, '_blank')
      // trigger chat event and gtm event
    }
  }

  return (
    <Stack direction="row" gap={3}>
      {chatButtons.map((chatButton) => (
        <StyledIconButton
          key={chatButton?.id}
          onClick={() => handleClick(chatButton)}
        >
          <MessageTyping sx={{ color: 'secondary.dark' }} />
        </StyledIconButton>
      ))}
      {admin && chatButtons.length === 0 && (
        <StyledIconButton key="default">
          <AddSquare4 sx={{ color: 'secondary.dark' }} />
        </StyledIconButton>
      )}
    </Stack>
  )
}
