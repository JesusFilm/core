import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Button } from '@mui/material'

import { SignUpFields } from '../../../../__generated__/SignUpFields'

import TextField from './TextField'

export interface SignUpProps extends SignUpFields {}

interface SignUpFormValues {
  name: string
  email: string
}

const SignUp = ({ action, ...props }: SignUpProps): ReactElement => {
  const initialValues: SignUpFormValues = { name: '', email: '' }
  const SignupSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be 2 characters or more')
      .max(50, 'Name must be 50 characters or less')
      .required('Required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Required')
  })

  const onSubmitHandler = (values: SignUpFormValues): void => {
    console.log(values)
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SignupSchema}
      onSubmit={(values, actions) => {
        onSubmitHandler(values)
        actions.setSubmitting(false)
      }}
    >
      {({ ...formikProps }) => (
        <Form
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <TextField {...formikProps} id="name" name="name" label="Name" />
          <TextField {...formikProps} id="email" name="email" label="Email" />
          {/* TODO: Use shared-ui Button */}
          <Button type="submit" variant="contained" size="large">
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default SignUp
