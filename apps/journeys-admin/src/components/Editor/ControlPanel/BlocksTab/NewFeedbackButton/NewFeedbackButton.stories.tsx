import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { NewFeedbackButton } from './NewFeedbackButton'

const NewFeedbackButtonStory = {
  ...simpleComponentConfig,
  component: NewFeedbackButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewFeedbackButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NewFeedbackButton />
    </MockedProvider>
  )
}

export default NewFeedbackButtonStory as Meta
