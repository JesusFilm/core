import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { NewRadioQuestionButton } from '.'

const NewRadioQuestionButtonStory = {
  ...journeysAdminConfig,
  component: NewRadioQuestionButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/RadioQuestion'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NewRadioQuestionButton />
    </MockedProvider>
  )
}

export default NewRadioQuestionButtonStory as Meta
