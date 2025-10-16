import { ApolloError, useMutation } from '@apollo/client'
import { graphql } from '@core/shared/gql'
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

type SignUpSubmissionEventCreateInput = {
  id?: string | null
  blockId: string
  stepId?: string | null
  name: string
  email: string
}
import { handleAction } from '../../libs/action'
import { useBlocks } from '../../libs/block'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { JourneyPlausibleEvents, keyify } from '../../libs/plausibleHelpers'
import { Icon } from '../Icon'
import type { IconFields } from '../Icon/iconFields'
import { TextField } from '../TextField'

type ActionUnion =
  | { __typename: 'NavigateToBlockAction'; blockId: string }
  | { __typename: 'LinkAction'; url: string }
  | { __typename: 'EmailAction'; email: string }
  | { __typename: 'PhoneAction'; phone: string }
  | { __typename: 'ChatAction' }
  | null

type SignUpFields = {
  __typename: 'SignUpBlock'
  id: string
  submitIconId: string | null
  submitLabel?: string | null
  action?: ActionUnion
}
import { ResultOf, VariablesOf } from '@core/shared/gql'

export const SIGN_UP_SUBMISSION_EVENT_CREATE = graphql(`
  mutation SignUpSubmissionEventCreate(
    $input: SignUpSubmissionEventCreateInput!
  ) {
    signUpSubmissionEventCreate(input: $input) {
      id
    }
  }
`)
type SignUpSubmissionEventCreate = ResultOf<
  typeof SIGN_UP_SUBMISSION_EVENT_CREATE
>
type SignUpSubmissionEventCreateVariables = VariablesOf<
  typeof SIGN_UP_SUBMISSION_EVENT_CREATE
>
type SignUpProps = TreeBlock<SignUpFields> & {
  uuid?: () => string
  editableSubmitLabel?: ReactElement
  sx?: SxProps
}

interface SignUpFormValues {
  name: string
  email: string
}

export const SignUp = (props: SignUpProps): ReactElement => {
  const {
    id: blockId,
    uuid = uuidv4,
    submitIconId,
    submitLabel,
    editableSubmitLabel,
    action,
    children,
    sx
  } = props
  const { t } = useTranslation('libs-journeys-ui')

  const submitIcon = (
    children as unknown as Array<TreeBlock<IconFields> | any>
  ).find((block: any) => block.id === submitIconId) as
    | TreeBlock<IconFields>
    | undefined

  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant, journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const { blockHistory, treeBlocks } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1] as TreeBlock<any>

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
                target:
                  action?.__typename === 'LinkAction'
                    ? action.url
                    : action?.__typename === 'NavigateToBlockAction'
                      ? action.blockId
                      : action?.__typename === 'EmailAction'
                        ? action.email
                        : action?.__typename === 'PhoneAction'
                          ? action.phone
                          : undefined
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
              const nextStepSlug = getNextStepSlug(journey, action as any)
              handleAction(router, action as any, nextStepSlug)
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
