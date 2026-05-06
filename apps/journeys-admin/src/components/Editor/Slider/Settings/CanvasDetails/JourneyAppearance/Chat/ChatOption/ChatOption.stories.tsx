import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { MessagePlatform } from '../../../../../../../../../__generated__/globalTypes'
import { Drawer } from '../../../../Drawer'

import { ChatOption } from '.'

const ChatOptionStory: Meta<typeof ChatOption> = {
  ...simpleComponentConfig,
  component: ChatOption,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/ChatOption'
}

const Template: StoryObj<typeof ChatOption> = {
  render: (props) => (
    <MockedProvider>
      <Drawer title="Chat Option">
        <ChatOption {...props} />
      </Drawer>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    title: 'Default Option',
    chatButton: {
      __typename: 'ChatButton',
      id: 'chatButton1.id',
      link: 'https://example.com',
      platform: MessagePlatform.facebook
    },
    platform: MessagePlatform.facebook,
    active: false,
    journeyId: '1',
    disableSelection: false
  }
}

export const Complete = {
  ...Template,
  args: {
    title: 'Complete Option',
    chatButton: {
      __typename: 'ChatButton',
      id: 'chatButton1.id',
      link: 'https://example.com',
      platform: MessagePlatform.tikTok
    },
    active: true,
    helperInfo: 'This is a helper message',
    journeyId: '1',
    enableIconSelect: true,
    disableSelection: false
  }
}

export const Icons = {
  ...Template,
  args: {
    title: 'Icons',
    chatButton: {
      __typename: 'ChatButton',
      id: 'chatButton1.id',
      link: 'https://example.com',
      platform: MessagePlatform.tikTok
    },
    active: true,
    journeyId: '1',
    enableIconSelect: true,
    disableSelection: false
  },
  play: async () => {
    const select = screen.getByText('TikTok')
    await userEvent.click(select)
  }
}

export const Disabled = {
  ...Template,
  args: {
    ...Default.args,
    title: 'Disabled Option',
    disableSelection: true
  }
}

export default ChatOptionStory
