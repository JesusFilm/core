import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useMutation, gql } from '@apollo/client'
import { Button } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'

import { TextField } from './TextField'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { SignUpResponseCreate } from '../../../../__generated__/SignUpResponseCreate'
import { handleAction } from '../../../libs/action'
import { Icon } from '../../Icon'
import { useRouter } from 'next/router'

export const SIGN_UP_RESPONSE_CREATE = gql`
  mutation SignUpResponseCreate($input: SignUpResponseCreateInput!) {
    signUpResponseCreate(input: $input) {
      id
      name
      email
    }
  }
`
interface SignUpProps extends TreeBlock<SignUpBlock> {
  uuid?: () => string
}

interface SignUpFormValues {
  name: string
  email: string
}

export const SignUp = ({
  id: blockId,
  uuid = uuidv4,
  submitIcon,
  // Use translated string when i18n is in
  submitLabel = 'Submit',
  action
}: SignUpProps): ReactElement => {
  const router = useRouter()
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
    const id = uuid()
    await signUpResponseCreate({
      variables: {
        input: {
          id,
          blockId,
          name: values.name,
          email: values.email
        }
      },
      optimisticResponse: {
        signUpResponseCreate: {
          id,
          __typename: 'SignUpResponse',
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
        void onSubmitHandler(values).then(() => {
          handleAction(router, action)
        })
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
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={
              submitIcon != null ? <Icon {...submitIcon} /> : undefined
            }
          >
            {submitLabel}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
