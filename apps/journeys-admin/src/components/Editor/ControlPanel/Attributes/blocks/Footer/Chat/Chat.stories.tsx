import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { waitFor } from '@testing-library/react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Chat } from '.'

const ChatStory = {
  ...simpleComponentConfig,
  component: Chat,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/Chat'
}

const Template: Story<ComponentProps<typeof Chat>> = () => (
  <MockedProvider>
    <Chat />
  </MockedProvider>
)

export const Default = Template.bind({})

export const Open = Template.bind({})
Open.play = async () => {
  const facebook = screen.getByRole('button', { name: 'Facebook Messenger' })
  const whatsApp = screen.getByRole('button', { name: 'WhatsApp' })
  const telegram = screen.getByRole('button', { name: 'Telegram' })
  const custom = screen.getByRole('button', { name: 'Custom' })

  await waitFor(() => {
    userEvent.click(facebook)
    userEvent.click(whatsApp)
    userEvent.click(telegram)
    userEvent.click(custom)
  })
}

export default ChatStory as Meta
