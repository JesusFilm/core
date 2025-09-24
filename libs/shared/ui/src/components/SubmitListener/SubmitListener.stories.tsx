import TextField from '@mui/material/TextField'
import { Meta, StoryObj } from '@storybook/nextjs'
import { Form, Formik } from 'formik'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import { SubmitListener } from '.'

const Demo: Meta<typeof SubmitListener> = {
  ...simpleComponentConfig,
  title: 'Shared-Ui/SubmitListener',
  component: SubmitListener,
  parameters: {
    ...simpleComponentConfig.parameters,
    chromatic: {
      disableSnapshot: true
    },
    docs: {
      description: {
        component:
          'This component should be included as a child of a Formik component. It will then automatically submit after the form after any changes.'
      }
    }
  },
  argTypes: { onSubmit: { action: 'submitted' } }
}

const Template: StoryObj<
  ComponentProps<typeof SubmitListener> & { onSubmit: () => void }
> = {
  render: ({ onSubmit }) => {
    return (
      <Formik initialValues={{ name: '' }} onSubmit={onSubmit}>
        {({ values, handleChange }) => (
          <Form>
            <TextField
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              aria-label="name"
              label="Name"
            />
            <SubmitListener />
          </Form>
        )}
      </Formik>
    )
  }
}

export const Default = { ...Template }

export default Demo
