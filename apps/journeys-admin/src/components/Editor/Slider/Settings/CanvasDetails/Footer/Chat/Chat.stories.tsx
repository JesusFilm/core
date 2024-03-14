import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { Chat } from '.'

const ChatStory: Meta<typeof Chat> = {
  ...simpleComponentConfig,
  component: Chat,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/Chat'
}

const Template: StoryObj<typeof Chat> = {
  render: () => (
    <MockedProvider>
      <Chat />
    </MockedProvider>
  )
}
export const Default = { ...Template }

export const Open = {
  ...Template,
  play: async () => {
    const facebook = screen.getByRole('button', { name: 'Facebook Messenger' })
    const whatsApp = screen.getByRole('button', { name: 'WhatsApp' })
    const telegram = screen.getByRole('button', { name: 'Telegram' })
    const custom = screen.getByRole('button', { name: 'Custom' })

    await userEvent.click(facebook)
    await userEvent.click(whatsApp)
    await userEvent.click(telegram)
    await userEvent.click(custom)
  }
}

export default ChatStory
