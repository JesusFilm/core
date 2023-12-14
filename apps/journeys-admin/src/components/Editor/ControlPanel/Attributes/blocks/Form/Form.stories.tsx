import { Form as FormType } from '@formium/types'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Form } from '.'

const FormDemo: Meta<typeof Form> = {
  ...simpleComponentConfig,
  component: Form,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Form'
}

const Template: StoryObj<ComponentProps<typeof Form>> = {
  render: ({ ...args }) => (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <Form {...args} />
    </Stack>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    form: null,
    action: null
  }
}

const form = {
  id: 'form.id',
  name: 'form name'
} as unknown as FormType

export const Filled = {
  ...Template,
  args: {
    id: 'id',
    form,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'button1.id',
      gtmEventName: 'navigateToBlock',
      blockId: 'step2.id'
    }
  }
}

export default FormDemo
