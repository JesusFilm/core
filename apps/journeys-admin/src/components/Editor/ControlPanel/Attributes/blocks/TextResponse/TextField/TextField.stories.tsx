import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { TextField } from './TextField'

const TextFieldStory = {
  ...journeysAdminConfig,
  component: TextField,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse/TextField'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <TextField />
    </MockedProvider>
  )
}

export default TextFieldStory as Meta
