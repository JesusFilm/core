import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { screen, userEvent } from '@storybook/testing-library'
import { waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { ChatOption } from '.'

const ChatOptionStory = {
  ...simpleComponentConfig,
  component: ChatOption,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/Chat/ChatOption'
}

const Template: Story<ComponentProps<typeof ChatOption>> = (props) => (
  <MockedProvider>
    <ChatOption {...props} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
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

export const Complete = Template.bind({})
Complete.args = {
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
}
Complete.play = async () => {
  const button = screen.getByRole('button', { name: 'Complete Option' })
  await waitFor(() => {
    userEvent.click(button)
  })
}

export const Icons = Template.bind({})
Icons.args = {
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
}
Icons.play = async () => {
  const accordion = screen.getByRole('button', { name: 'Icons' })
  await waitFor(() => {
    userEvent.click(accordion)
  })
  const select = screen.getByText('TikTok')
  await waitFor(() => {
    userEvent.click(select)
  })
}

export const Disabled = Template.bind({})
Disabled.args = {
  ...Default.args,
  title: 'Disabled Option',
  disableSelection: true
}

export default ChatOptionStory as Meta
