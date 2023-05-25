import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import EditRounded from '@mui/icons-material/EditRounded'
import { simpleComponentConfig } from '../../libs/storybook'
import { TextFieldForm } from './TextFieldForm'

const TextFieldFormStory = {
  ...simpleComponentConfig,
  component: TextFieldForm,
  title: 'Journeys-Admin/TextFieldForm'
}

const Template: Story<ComponentProps<typeof TextFieldForm>> = (args) => (
  <TextFieldForm
    label="Navigate to..."
    initialValues="Default Value"
    handleSubmit={noop}
    endIcon={args.endIcon}
  />
)

export const Default = Template.bind({})

export const EndIcon = Template.bind({})
EndIcon.args = {
  endIcon: <EditRounded />
}

export default TextFieldFormStory as Meta
