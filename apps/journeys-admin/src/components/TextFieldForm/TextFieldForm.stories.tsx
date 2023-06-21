import { Story, Meta } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import { object, string } from 'yup'
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
    <TextFieldForm onSubmit={noop} />
    <TextFieldForm
      id="Initial Value"
      label="Initial Value"
      initialValue="Default Value"
      onSubmit={noop}
    />
    <TextFieldForm
      id="Helper text"
      label="Helper text"
      helperText="Hint"
      onSubmit={noop}
    />
    <TextFieldForm
      id="Error"
      label="Error"
      validationSchema={object({
        Error: string().min(3)
      })}
      onSubmit={noop}
    />
    <TextFieldForm
      id="Placeholder"
      label="Placeholder"
      placeholder="Placeholder"
      onSubmit={noop}
      focused
    />
    <TextFieldForm
      id="Start Icon"
      label="Start Icon"
      onSubmit={noop}
      startIcon={
        <InputAdornment position="start">
          <EditRounded />
        </InputAdornment>
      }
    />
    <TextFieldForm
      id="End Icon"
      label="End Icon"
      onSubmit={noop}
      endIcon={<EditRounded />}
      hiddenLabel
    />
    <TextFieldForm id="Disabled" label="Disabled" onSubmit={noop} disabled />
    <TextFieldForm
      id="Required"
      label="Required"
      validationSchema={object({
        Required: string().required('Please fill in this field.')
      })}
      onSubmit={noop}
    />
  </Stack>
)

export const States = Template.bind({})
States.play = async () => {
  await waitFor(() => {
    userEvent.type(screen.getByRole('textbox', { name: 'Error' }), 'a')
  })
}

export default TextFieldFormStory as Meta
