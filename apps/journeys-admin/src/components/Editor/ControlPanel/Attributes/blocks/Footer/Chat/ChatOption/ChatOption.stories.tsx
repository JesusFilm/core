import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import { screen, userEvent } from '@storybook/testing-library'
import { waitFor } from '@testing-library/react'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { ChatOption } from '.'

const ChatOptionStory = {
  ...simpleComponentConfig,
  component: ChatOption,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/Chat/ChatOption'
}

const Template: Story<ComponentProps<typeof ChatOption>> = (props) => (
  <ChatOption {...props} />
)

export const Default = Template.bind({})
Default.args = {
  value: {
    id: '1',
    title: 'Default Option',
    linkValue: '',
    active: false
  },
  disableSelection: false,
  setButton: noop,
  handleUpdate: noop,
  handleToggle: noop
}

export const Complete = Template.bind({})
Complete.args = {
  value: {
    id: '1',
    title: 'Complete Option',
    linkValue: 'https://example.com',
    active: true,
    chatIcon: ChatPlatform.tikTok,
    enableIconSelect: true,
    helperInfo: 'This is a helper message'
  },
  disableSelection: false,
  setButton: noop,
  handleUpdate: noop,
  handleToggle: noop
}
Complete.play = async () => {
  const button = screen.getByRole('button', { name: 'Complete Option' })
  await waitFor(() => {
    userEvent.click(button)
  })
}

export const Icons = Template.bind({})
Icons.args = {
  value: {
    id: '1',
    title: 'Icons test',
    linkValue: 'https://example.com',
    active: true,
    chatIcon: null,
    enableIconSelect: true
  },
  disableSelection: false,
  setButton: noop,
  handleUpdate: noop,
  handleToggle: noop
}
Icons.play = async () => {
  const accordion = screen.getByRole('button', { name: 'Icons test' })
  await waitFor(() => {
    userEvent.click(accordion)
  })
  const select = screen.getByRole('button', { name: 'Chat Platform' })
  await waitFor(() => {
    userEvent.click(select)
  })
}

export const Disabled = Template.bind({})
Disabled.args = {
  value: {
    id: '1',
    title: 'Default Option',
    linkValue: '',
    active: false
  },
  disableSelection: true,
  setButton: noop,
  handleUpdate: noop,
  handleToggle: noop
}

export default ChatOptionStory as Meta
