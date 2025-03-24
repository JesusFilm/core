import { ApolloError, gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/system/styleFunctionSx'
import { sendGTMEvent } from '@next/third-parties/google'
import { Form, Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useBlocks } from '../../libs/block'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { TextField } from '../TextField'

import { TextResponseFields } from './__generated__/TextResponseFields'
import { TextResponseSubmissionEventCreate } from './__generated__/TextResponseSubmissionEventCreate'

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

export const TextResponse = ({
  id: blockId,
  uuid = uuidv4,
  label,
  hint,
  minRows
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

  const placeholder = 'Placeholder'

  const onSubmitHandler = async (
    values: TextResponseFormValues
  ): Promise<void> => {
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
      <Formik initialValues={initialValues} onSubmit={noop} enableReinitialize>
        {({ values, handleChange, handleBlur }) => (
          <Form data-testid={`textResponse-${blockId}`}>
            <Stack flexDirection="column" spacing={1}>
              <Typography id="textResponse-label" variant="subtitle2">
                {label === '' ? 'Label' : label}
              </Typography>
              <TextField
                id="textResponse-field"
                name="response"
                placeholder={placeholder}
                value={values.response}
                helperText={hint != null ? hint : ''}
                multiline
                disabled={loading}
                minRows={minRows ?? 3}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChange}
                onBlurCapture={async (e) => {
                  handleBlur(e)
                  if (values.response !== value) {
                    setValue(values.response)
                    await onSubmitHandler(values)
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
