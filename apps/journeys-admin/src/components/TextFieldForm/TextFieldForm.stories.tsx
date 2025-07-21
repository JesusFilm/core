import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import noop from 'lodash/noop'
import { object, string } from 'yup'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { TextFieldForm } from './TextFieldForm'

const TextFieldFormStory: Meta<typeof TextFieldForm> = {
  ...simpleComponentConfig,
  component: TextFieldForm,
  title: 'Journeys-Admin/TextFieldForm'
}

const Template: StoryObj<typeof TextFieldForm> = {
  render: () => (
    <Stack spacing={4}>
      <TextFieldForm id="default" onSubmit={noop} />
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
            <Edit2Icon />
          </InputAdornment>
        }
      />
      <TextFieldForm
        id="End Icon"
        label="End Icon"
        onSubmit={noop}
        endIcon={<Edit2Icon />}
        hiddenLabel
      />
      <TextFieldForm id="Disabled" label="Disabled" onSubmit={noop} disabled />
      <TextFieldForm
        id="Required"
        label="Required"
        initialValue="Required value"
        validationSchema={object({
          Required: string().required('Please fill in this field.')
        })}
        onSubmit={noop}
      />
    </Stack>
  )
}

export const States = {
  ...Template,
  play: async () => {
    await userEvent.type(screen.getByRole('textbox', { name: 'Error' }), 'a')
  }
}

export default TextFieldFormStory
