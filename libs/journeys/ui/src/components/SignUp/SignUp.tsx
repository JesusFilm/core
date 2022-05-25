import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import { useRouter } from 'next/router'
import { object, string } from 'yup'
import { useMutation, gql, ApolloError } from '@apollo/client'
import { SxProps } from '@mui/system/styleFunctionSx'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import { v4 as uuidv4 } from 'uuid'
import { useSnackbar } from 'notistack'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { TreeBlock, handleAction, useEditor, useJourney } from '../..'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'
import { SignUpSubmissionEventCreate } from './__generated__/SignUpSubmissionEventCreate'
import { SignUpFields } from './__generated__/SignUpFields'
import { TextField } from './TextField'

export const SIGN_UP_SUBMISSION_EVENT_CREATE = gql`
  mutation SignUpSubmissionEventCreate(
    $input: SignUpSubmissionEventCreateInput!
  ) {
    signUpSubmissionEventCreate(input: $input) {
      id
      name
      email
    }
  }
`
interface SignUpProps extends TreeBlock<SignUpFields> {
  uuid?: () => string
  editableSubmitLabel?: ReactElement
  sx?: SxProps
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
  editableSubmitLabel,
  action,
  children,
  sx,
  ...props
}: SignUpProps): ReactElement => {
  const { t } = useTranslation('libs-journeys-ui')

  const submitIcon = children.find((block) => block.id === submitIconId) as
    | TreeBlock<IconFields>
    | undefined

  const { admin } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const router = useRouter()
  const [signUpSubmissionEventCreate, { loading }] =
    useMutation<SignUpSubmissionEventCreate>(SIGN_UP_SUBMISSION_EVENT_CREATE)

  const initialValues: SignUpFormValues = { name: '', email: '' }
  const signUpSchema = object().shape({
    name: string()
      .min(2, t('Name must be 2 characters or more'))
      .max(50, t('Name must be 50 characters or less'))
      .required(t('Required')),
    email: string()
      .email(t('Please enter a valid email address'))
      .required(t('Required'))
  })

  const onSubmitHandler = async (values: SignUpFormValues): Promise<void> => {
    if (!admin) {
      const id = uuid()
      try {
        await signUpSubmissionEventCreate({
          variables: {
            input: {
              id,
              blockId,
              name: values.name,
              email: values.email
            }
          }
        })
        TagManager.dataLayer({
          dataLayer: {
            event: 'sign_up_submission',
            eventId: id,
            blockId
          }
        })
      } catch (e) {
        if (e instanceof ApolloError) {
          enqueueSnackbar(e.message, {
            variant: 'error',
            preventDuplicate: true
          })
        }
      }
    }
  }

  const {
    state: { selectedBlock }
  } = useEditor()

  return (
    <Box sx={{ mb: 4 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={
          selectedBlock === undefined ? signUpSchema : undefined
        }
        onSubmit={(values) => {
          if (selectedBlock === undefined) {
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
              flexDirection: 'column'
            }}
          >
            <TextField
              data-testid="name"
              {...formikProps}
              id="name"
              name="name"
              label={t('Name')}
              disabled={selectedBlock !== undefined}
            />
            <TextField
              {...formikProps}
              id="email"
              name="email"
              label={t('Email')}
              disabled={selectedBlock !== undefined}
            />
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading}
              size="large"
              startIcon={
                submitIcon != null ? <Icon {...submitIcon} /> : undefined
              }
              sx={{
                ...sx,
                mb: 0
              }}
            >
              {editableSubmitLabel ?? submitLabel ?? t('Submit')}
            </LoadingButton>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
