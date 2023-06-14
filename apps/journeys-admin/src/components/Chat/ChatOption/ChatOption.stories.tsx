import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import { screen, userEvent } from '@storybook/testing-library'
import { waitFor } from '@testing-library/react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ChatPlatform } from '../../../../__generated__/globalTypes'
import { ChatOption } from '.'

const ChatOptionStory = {
  ...simpleComponentConfig,
  component: ChatOption,
  title: 'Journeys-Admin/Chat/ChatOption'
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
  setValue: noop,
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
  setValue: noop,
  handleUpdate: noop,
  handleToggle: noop
}
Complete.play = async () => {
  const button = screen.getByRole('button', { name: 'Complete Option' })
  await waitFor(() => {
    userEvent.click(button)
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
  setValue: noop,
  handleUpdate: noop,
  handleToggle: noop
}

export default ChatOptionStory as Meta
