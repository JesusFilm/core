import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { ChatPlatform } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import {
  JourneyFields_chatButtons as ChatButton,
  JourneyFields as Journey
} from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '../../../libs/simpleComponentConfig'

import { ChatButtons } from '.'

const ChatButtonsDemo = {
  ...simpleComponentConfig,
  component: ChatButtons,
  title: 'Journeys-Ui/StepFooter/ChatButtons'
}

const Template: Story<{ chatButtons: ChatButton[] }> = ({ chatButtons }) => {
  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            language: {
              __typename: 'Language',
              id: '529',
              bcp47: 'en',
              iso3: 'eng'
            },
            chatButtons
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <ChatButtons />
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  chatButtons: []
}

export const Platform = Template.bind({})
Platform.args = {
  chatButtons: [
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
    },
    {
      __typename: 'ChatButton',
      id: '3',
      link: 'https://whatsapp.com/',
      platform: ChatPlatform.whatsApp
    },
    {
      __typename: 'ChatButton',
      id: '4',
      link: 'https://instagram.com/',
      platform: ChatPlatform.instagram
    },
    {
      __typename: 'ChatButton',
      id: '5',
      link: 'https://viber.com/',
      platform: ChatPlatform.viber
    },
    {
      __typename: 'ChatButton',
      id: '6',
      link: 'https://vk.com/',
      platform: ChatPlatform.vk
    },
    {
      __typename: 'ChatButton',
      id: '7',
      link: 'https://snapchat.com/',
      platform: ChatPlatform.snapchat
    },
    {
      __typename: 'ChatButton',
      id: '8',
      link: 'https://skype.com/',
      platform: ChatPlatform.skype
    },
    {
      __typename: 'ChatButton',
      id: '9',
      link: 'https://line.me/',
      platform: ChatPlatform.line
    },
    {
      __typename: 'ChatButton',
      id: '10',
      link: 'https://tiktok.com/',
      platform: ChatPlatform.tikTok
    }
  ]
}

export default ChatButtonsDemo as Meta
