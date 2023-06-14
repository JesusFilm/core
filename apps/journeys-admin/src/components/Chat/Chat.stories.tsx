import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../libs/storybook'
import { Chat } from '.'

const ChatStory = {
  ...simpleComponentConfig,
  component: Chat,
  title: 'Journeys-Admin/Chat'
}

const Template: Story<ComponentProps<typeof Chat>> = () => <Chat />

export const Default = Template.bind({})

export default ChatStory as Meta
