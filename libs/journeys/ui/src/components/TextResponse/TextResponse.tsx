import { ApolloError, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/system/styleFunctionSx'
import { sendGTMEvent } from '@next/third-parties/google'
import { Form, Formik, FormikErrors } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { object, string } from 'yup'

import { TextResponseType } from '../../../__generated__/globalTypes'
import { useBlocks } from '../../libs/block'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { TextField } from '../TextField'

import { TextResponseFields } from './__generated__/TextResponseFields'
import { TextResponseSubmissionEventCreate } from './__generated__/TextResponseSubmissionEventCreate'

/**
 * GraphQL mutation for creating a text response submission event.
 */
export const TEXT_RESPONSE_SUBMISSION_EVENT_CREATE = gql`
  mutation TextResponseSubmissionEventCreate(
    $input: TextResponseSubmissionEventCreateInput!
  ) {
    textResponseSubmissionEventCreate(input: $input) {
      id
    }
  }
`
interface TextResponseProps extends TreeBlock<TextResponseFields> {
  uuid?: () => string
  editableSubmitLabel?: ReactElement
  sx?: SxProps
}
interface TextResponseFormValues {
  response: string
}

/**
 * A component that renders a text input field for user responses.
 * Captures and submits user's text input, sending data to the backend and triggering GTM events.
 *
 * @param {TextResponseProps} props - The component props.
 * @param {string} props.id - Block ID.
 * @param {() => string} [props.uuid=uuidv4] - Function to generate a UUID.
 * @param {string} props.label - Label for the text input.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.hint] - Helper text displayed below the input.
 * @param {number} [props.minRows] - Minimum number of rows for the text area.
 * @param {boolean} [props.required] - Indicates if the field is required.
 * @returns {ReactElement} The TextResponse component.
 */
export const TextResponse = ({
  id: blockId,
  uuid = uuidv4,
  label,
  placeholder,
  hint,
  minRows,
  required,
  type
}: TextResponseProps): ReactElement => {
  const { t } = useTranslation('libs-journeys-ui')

  const [value, setValue] = useState('')

  const { variant } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const { blockHistory, treeBlocks } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
      : 'None'

  const [textResponseSubmissionEventCreate, { loading }] =
    useMutation<TextResponseSubmissionEventCreate>(
      TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
    )

  const initialValues: TextResponseFormValues = { response: '' }

  const validationSchema = object().shape({
    response: (() => {
      let schema = string()
      if (required === true) {
        schema = schema.required(t('Required'))
      }
      if (type === TextResponseType.name) {
        schema = schema
          .min(2, t('Name must be 2 characters or more'))
          .max(50, t('Name must be 50 characters or less'))
      }
      if (type === TextResponseType.email) {
        schema = schema.email(t('Please enter a valid email address'))
      }
      return schema
    })()
  })

  const onSubmitHandler = async (
    values: TextResponseFormValues,
    errors: FormikErrors<TextResponseFormValues>
  ): Promise<void> => {
    if (errors.response) return

    if (variant === 'default' || variant === 'embed') {
      const id = uuid()
      if (values.response.trim() !== '') {
        try {
          await textResponseSubmissionEventCreate({
            variables: {
              input: {
                id,
                blockId,
                stepId: activeBlock?.id,
                label: heading,
                value: values.response
              }
            }
          })
          sendGTMEvent({
            event: 'text_response_submission',
            eventId: id,
            blockId,
            stepName: heading
          })
        } catch (e) {
          if (e instanceof ApolloError) {
            enqueueSnackbar('Could not send response, please try again.', {
              variant: 'error',
              preventDuplicate: true
            })
          }
        }
      }
    }
  }

  const {
    state: { selectedBlock }
  } = useEditor()

  return (
    <Box sx={{ mb: 4 }} data-testid="JourneysTextResponse">
      <Formik
        initialValues={initialValues}
        onSubmit={noop}
        enableReinitialize
        validationSchema={
          selectedBlock !== undefined ? undefined : validationSchema
        }
        validateOnBlur
      >
        {({ values, errors, handleChange, handleBlur }) => (
          <Form data-testid={`textResponse-${blockId}`}>
            <Stack flexDirection="column" spacing={1}>
              <Typography
                id="textResponse-label"
                variant="subtitle2"
                sx={{
                  fontsize: 14
                }}
              >
                {label === '' ? 'Label' : label}
                {(required ?? false) ? '*' : ''}
              </Typography>
              <TextField
                id="textResponse-field"
                name="response"
                placeholder={placeholder != null ? placeholder : ''}
                value={values.response}
                helperText={
                  errors.response !== null
                    ? errors.response
                    : hint != null
                      ? hint
                      : ''
                }
                multiline
                disabled={loading}
                minRows={minRows ?? 3}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChange}
                onBlurCapture={async (e) => {
                  handleBlur(e)
                  if (values.response !== value) {
                    setValue(values.response)
                    await onSubmitHandler(values, errors)
                  }
                }}
                slotProps={{
                  htmlInput: {
                    'aria-labelledby': 'textResponse-label',
                    maxLength: 1000,
                    readOnly: selectedBlock !== undefined,
                    sx: {
                      pointerEvents:
                        selectedBlock !== undefined ? 'none' : 'auto',
                      pt: 2,
                      pb: 1
                    }
                  },
                  input: {
                    sx: {
                      pt: 0
                    }
                  }
                }}
                sx={{
                  '&.MuiTextField-root': {
                    mb: 0
                  }
                }}
              />
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
