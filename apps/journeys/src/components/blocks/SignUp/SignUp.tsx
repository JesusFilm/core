import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useMutation, gql } from '@apollo/client'
import { Button } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'

import TextField from './TextField'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { SignUpResponseCreate } from '../../../../__generated__/SignUpResponseCreate'
import { handleAction } from '../../../libs/action'

export const SIGN_UP_RESPONSE_CREATE = gql`
  mutation SignUpResponseCreate($input: SignUpResponseCreateInput!) {
    signUpResponseCreate(input: $input) {
      id
      name
      email
    }
  }
`

interface SignUpFormValues {
  name: string
  email: string
}

export const SignUp = ({
  id,
  action
}: TreeBlock<SignUpBlock>): ReactElement => {
  const [signUpResponseCreate] = useMutation<SignUpResponseCreate>(
    SIGN_UP_RESPONSE_CREATE
  )

  const initialValues: SignUpFormValues = { name: '', email: '' }
  const signUpSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be 2 characters or more')
      .max(50, 'Name must be 50 characters or less')
      .required('Required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Required')
  })

  const onSubmitHandler = async (values: SignUpFormValues): Promise<void> => {
    const uuid = uuidv4()
    await signUpResponseCreate({
      variables: {
        input: {
          id: uuid,
          blockId: id,
          name: values.name,
          email: values.email
        }
      }
      // TODO: Set server error responses when available
    })
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={signUpSchema}
      onSubmit={(values) => {
        // TODO: Handle server error responses when available
        void onSubmitHandler(values)
        handleAction(action)
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
          <Button type="submit" variant="contained" size="large">
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  )
}
