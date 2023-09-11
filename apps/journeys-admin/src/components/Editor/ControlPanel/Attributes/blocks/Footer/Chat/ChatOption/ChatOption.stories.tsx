import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'

import { ChatOption } from '.'

const ChatOptionStory: Meta<typeof ChatOption> = {
  ...simpleComponentConfig,
  component: ChatOption,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/Chat/ChatOption'
}

const Template: StoryObj<typeof ChatOption> = {
  render: (props) => (
    <MockedProvider>
      <ChatOption {...props} />
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
      platform: ChatPlatform.facebook
    },
    platform: ChatPlatform.facebook,
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
      platform: ChatPlatform.tikTok
    },
    active: true,
    helperInfo: 'This is a helper message',
    journeyId: '1',
    enableIconSelect: true,
    disableSelection: false
  },
  play: async () => {
    const button = screen.getByRole('button', { name: 'Complete Option' })
    await userEvent.click(button)
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
      platform: ChatPlatform.tikTok
    },
    active: true,
    journeyId: '1',
    enableIconSelect: true,
    disableSelection: false
  },
  play: async () => {
    const accordion = screen.getByRole('button', { name: 'Icons' })
    await userEvent.click(accordion)
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
