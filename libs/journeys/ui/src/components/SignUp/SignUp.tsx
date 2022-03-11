import { ReactElement, MouseEvent } from 'react'
import { Formik, Form } from 'formik'
import { useRouter } from 'next/router'
import { object, string } from 'yup'
import { useMutation, gql } from '@apollo/client'
import Button from '@mui/material/Button'
import { v4 as uuidv4 } from 'uuid'
import { TreeBlock, handleAction, useEditor, ActiveTab, ActiveFab } from '../..'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'
import { SignUpResponseCreate } from './__generated__/SignUpResponseCreate'
import { SignUpFields } from './__generated__/SignUpFields'
import { TextField } from './TextField'

export const SIGN_UP_RESPONSE_CREATE = gql`
  mutation SignUpResponseCreate($input: SignUpResponseCreateInput!) {
    signUpResponseCreate(input: $input) {
      id
      name
      email
    }
  }
`
interface SignUpProps extends TreeBlock<SignUpFields> {
  uuid?: () => string
}

interface SignUpFormValues {
  name: string
  email: string
}

export const SignUp = ({
  id: blockId,
  uuid = uuidv4,
  submitIconId,
  // Use translated string when i18n is in
  submitLabel,
  action,
  children,
  ...props
}: SignUpProps): ReactElement => {
  const submitIcon = children.find((block) => block.id === submitIconId) as
    | TreeBlock<IconFields>
    | undefined

  const router = useRouter()
  const [signUpResponseCreate] = useMutation<SignUpResponseCreate>(
    SIGN_UP_RESPONSE_CREATE
  )

  const initialValues: SignUpFormValues = { name: '', email: '' }
  const signUpSchema = object().shape({
    name: string()
      .min(2, 'Name must be 2 characters or more')
      .max(50, 'Name must be 50 characters or less')
      .required('Required'),
    email: string()
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

  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    const block: TreeBlock<SignUpFields> = {
      id: blockId,
      submitIconId,
      submitLabel,
      action,
      children,
      ...props
    }

    if (selectedBlock?.id === block.id) {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
    } else {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
      dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Properties })
      dispatch({ type: 'SetSelectedBlockAction', block })
      dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={selectedBlock === undefined ? signUpSchema : undefined}
      onSubmit={(values) => {
        if (selectedBlock === undefined) {
          // TODO: Handle server error responses when available
          void onSubmitHandler(values).then(() => {
            handleAction(router, action)
          })
        }
      }}
    >
      {({ ...formikProps }) => (
        <Form
          data-testid={`signUp-${blockId}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            outline:
              selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
            outlineOffset: '5px'
          }}
          onClick={selectedBlock === undefined ? undefined : handleSelectBlock}
        >
          <TextField
            {...formikProps}
            id="name"
            name="name"
            label="Name"
            disabled={selectedBlock !== undefined}
          />
          <TextField
            {...formikProps}
            id="email"
            name="email"
            label="Email"
            disabled={selectedBlock !== undefined}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={
              submitIcon != null ? <Icon {...submitIcon} /> : undefined
            }
          >
            {submitLabel ?? 'Submit'}
          </Button>
        </Form>
      )}
    </Formik>
  )
}
