import { ApolloError, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/system/styleFunctionSx'
import { sendGTMEvent } from '@next/third-parties/google'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { object, string } from 'yup'

import { SignUpSubmissionEventCreateInput } from '../../../__generated__/globalTypes'
import { handleAction } from '../../libs/action'
import { useBlocks } from '../../libs/block'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { JourneyPlausibleEvents, keyify } from '../../libs/plausibleHelpers'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'
import { TextField } from '../TextField'

import { SignUpFields } from './__generated__/SignUpFields'
import {
  SignUpSubmissionEventCreate,
  SignUpSubmissionEventCreateVariables
} from './__generated__/SignUpSubmissionEventCreate'

export const SIGN_UP_SUBMISSION_EVENT_CREATE = gql`
  mutation SignUpSubmissionEventCreate(
    $input: SignUpSubmissionEventCreateInput!
  ) {
    signUpSubmissionEventCreate(input: $input) {
      id
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

  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant, journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const { blockHistory, treeBlocks } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
      : 'None'

  const router = useRouter()
  const [signUpSubmissionEventCreate, { loading }] = useMutation<
    SignUpSubmissionEventCreate,
    SignUpSubmissionEventCreateVariables
  >(SIGN_UP_SUBMISSION_EVENT_CREATE)

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
    if (variant === 'default' || variant === 'embed') {
      const id = uuid()
      const input: SignUpSubmissionEventCreateInput = {
        id,
        blockId,
        stepId: activeBlock?.id,
        name: values.name,
        email: values.email
      }
      try {
        await signUpSubmissionEventCreate({
          variables: {
            input
          }
        })
        if (journey != null) {
          plausible('signupSubmit', {
            u: `${window.location.origin}/${journey.id}/${input.stepId}`,
            props: {
              ...input,
              key: keyify({
                stepId: input.stepId ?? '',
                event: 'signupSubmit',
                blockId: input.blockId,
                target: action
              }),
              simpleKey: keyify({
                stepId: input.stepId ?? '',
                event: 'signupSubmit',
                blockId: input.blockId
              })
            }
          })
        }
        sendGTMEvent({
          event: 'sign_up_submission',
          eventId: id,
          blockId,
          stepName: heading
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
    <Box sx={{ mb: 4 }} data-testid="JourneysSignUp">
      <Formik
        initialValues={initialValues}
        validationSchema={
          selectedBlock === undefined ? signUpSchema : undefined
        }
        onSubmit={(values) => {
          if (selectedBlock === undefined) {
            void onSubmitHandler(values).then(() => {
              const nextStepSlug = getNextStepSlug(journey, action)
              handleAction(router, action, nextStepSlug)
            })
          }
        }}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form
            data-testid={`signUp-${blockId}`}
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <TextField
              data-testid="name"
              id="name"
              name="name"
              label={t('Name')}
              value={values.name}
              onClick={(e) => e.stopPropagation()}
              onChange={handleChange}
              onBlur={handleBlur}
              InputProps={{
                readOnly: selectedBlock !== undefined,
                sx: {
                  pointerEvents: selectedBlock !== undefined ? 'none' : 'auto'
                }
              }}
            />
            <TextField
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              id="email"
              name="email"
              label={t('Email')}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                readOnly: selectedBlock !== undefined,
                sx: {
                  pointerEvents: selectedBlock !== undefined ? 'none' : 'auto'
                }
              }}
            />
            <Button
              type="submit"
              data-testid="submit"
              variant="contained"
              loading={loading}
              size="large"
              startIcon={
                submitIcon != null ? <Icon {...submitIcon} /> : undefined
              }
              onClick={(e) => e.stopPropagation()}
              sx={{
                ...sx,
                mb: 0
              }}
            >
              <span>
                {editableSubmitLabel != null
                  ? editableSubmitLabel
                  : submitLabel != null && submitLabel !== ''
                    ? submitLabel
                    : t('Submit')}
              </span>
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
