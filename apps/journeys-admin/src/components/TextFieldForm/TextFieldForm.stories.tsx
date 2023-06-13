import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import EditRounded from '@mui/icons-material/EditRounded'
import Stack from '@mui/material/Stack'
import InputAdornment from '@mui/material/InputAdornment'
import { simpleComponentConfig } from '../../libs/storybook'
import { TextFieldForm } from './TextFieldForm'

const TextFieldFormStory = {
  ...simpleComponentConfig,
  component: TextFieldForm,
  title: 'Journeys-Admin/TextFieldForm'
}

const Template: Story<ComponentProps<typeof TextFieldForm>> = () => (
  <Stack spacing={4}>
    <TextFieldForm handleSubmit={noop} />
    <TextFieldForm
      label="Initial Value"
      initialValues="Default Value"
      handleSubmit={noop}
    />
    <TextFieldForm label="Helper text" helperText="Hint" handleSubmit={noop} />
    <TextFieldForm
      label="Placeholder"
      placeholder="Placeholder"
      handleSubmit={noop}
    />
    <TextFieldForm
      initialValues="Start Icon"
      handleSubmit={noop}
      startIcon={
        <InputAdornment position="start">
          <EditRounded />
        </InputAdornment>
      }
    />
    <TextFieldForm
      label="End Icon"
      handleSubmit={noop}
      endIcon={<EditRounded />}
      hiddenLabel
    />
    <TextFieldForm label="Disabled" handleSubmit={noop} disabled />
  </Stack>
)

export const States = Template.bind({})

export default TextFieldFormStory as Meta
