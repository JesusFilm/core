import { Story, Meta } from '@storybook/react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import TextField, { TextFieldProps } from './TextField'

const Demo = {
  component: TextField,
  title: 'shared-ui/TextField'
}

const Template: Story<TextFieldProps> = () => (
  <Formik
    initialValues={{
      default: '',
      prepopulated: 'Prepopulated',
      errored: '',
      disabled: ''
    }}
    validationSchema={Yup.object().shape({
      errored: Yup.string().required('Required')
    })}
    initialTouched={{ errored: true }}
    validateOnMount
    onSubmit={(values) => {
      console.log(values)
    }}
  >
    {() => (
      <Form
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <TextField name="default" label="Default" />
        <TextField name="prepopulated" label="Prepopulated" />
        <TextField name="errored" label="Errored" />
        <TextField name="focused" label="Focused" focused />
        <TextField name="disabled" label="Disabled" disabled />
      </Form>
    )}
  </Formik>
)

export const States = Template.bind({})

// TODO: Future variants

// export const Size = Template.bind({})

// export const MultiLine = Template.bind({})

// export const Icon = Template.bind({})

// export const Select = Template.bind({})

export default Demo as Meta
