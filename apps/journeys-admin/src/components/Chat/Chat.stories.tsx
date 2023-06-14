import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../libs/storybook'
import { Chat } from '.'

const ChatStory = {
  ...simpleComponentConfig,
  component: Chat,
  title: 'Journeys-Admin/Chat'
}

const Template: Story<ComponentProps<typeof Chat>> = (props) => (
  <Chat {...props} />
)

export const Default = Template.bind({})
Default.args = {
  journeyId: '1'
}

export default ChatStory as Meta
