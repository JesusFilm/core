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
    label={args.label}
    initialValues="Default Value"
    handleSubmit={noop}
    startIcon={args.startIcon}
    endIcon={args.endIcon}
  />
)

export const Default = Template.bind({})
Default.args = {
  label: 'Navigate to...'
}

export const StartIcon = Template.bind({})
StartIcon.args = {
  startIcon: <EditRounded />,
  iconPosition: 'start'
}

export const EndIcon = Template.bind({})
EndIcon.args = {
  endIcon: <EditRounded />,
  iconPosition: 'end'
}

export default TextFieldFormStory as Meta
