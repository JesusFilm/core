import TextField from '@mui/material/TextField'
import { Meta, Story } from '@storybook/react'
import { Form, Formik } from 'formik'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'

import { SubmitListener } from '.'

const Demo = {
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

const Template: Story = (args) => {
  return (
    <Formik initialValues={{ name: '' }} onSubmit={args.onSubmit}>
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

export const Default = Template.bind({})

export default Demo as Meta
