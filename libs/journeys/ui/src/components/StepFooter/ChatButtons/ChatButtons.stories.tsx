import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import {
  JourneyFields_chatButtons as ChatButton,
  JourneyFields as Journey
} from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '../../../libs/simpleComponentConfig'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { ChatPlatform } from '../../../../__generated__/globalTypes'
import { ChatButtons } from './ChatButtons'

const ChatButtonsDemo = {
  ...simpleComponentConfig,
  component: ChatButtons,
  title: 'Journeys-Ui/StepFooter/ChatButtons'
}

const Template: Story = () => {
  const chatButtons: ChatButton[] = [
    {
      __typename: 'ChatButton',
      id: '1',
      link: 'https://m.me/',
      platform: ChatPlatform.facebook
    },
    {
      __typename: 'ChatButton',
      id: '2',
      link: 'https://other.messagingplatform/',
      platform: ChatPlatform.telegram
    }
  ]

  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: {
            admin: true,
            id: 'journeyId',
            chatButtons
          } as unknown as Journey
        }}
      >
        <Stack>
          <ChatButtons />
        </Stack>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default ChatButtonsDemo as Meta
