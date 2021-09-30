import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import TextField from './TextField'

import Button from '@mui/material/Button'

// TODO: Placeholder for generated type
export interface GetJourney_journey_blocks_SignUpBlock {
  __typename: 'SignUpBlock'
  id: string
  parentBlockId: string | null
}

export interface SignUpProps extends GetJourney_journey_blocks_SignUpBlock {
  heading?: string
  description?: string
}

interface SignUpFormValues {
  name: string
  email: string
}

const SignUp = ({
  heading,
  description,
  ...props
}: SignUpProps): ReactElement => {
  const initialValues: SignUpFormValues = { name: '', email: '' }
  // TODO: Get finalised validation messages - store messages in frontend
  const SignupSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be 2 characters or more')
      .max(50, 'Name must be 50 characters or less')
      .required('Required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Required')
  })

  return (
    // TODO: Change div to step container
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1>{heading}</h1>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={SignupSchema}
        onSubmit={(values, actions) => {
          console.log(values)
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
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default SignUp
