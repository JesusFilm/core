import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { RadioQuestion } from '.'

const RadioQuestionStory = {
  ...journeysAdminConfig,
  component: RadioQuestion,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/RadioQuestion'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <RadioQuestion />
    </MockedProvider>
  )
}

export default RadioQuestionStory as Meta
