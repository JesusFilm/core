import { ApolloError, gql, useMutation } from '@apollo/client'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/system/styleFunctionSx'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { handleAction } from '../../libs/action'
import { useBlocks } from '../../libs/block'
import type { TreeBlock } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'
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
  minRows,
  submitIconId,
  submitLabel,
  editableSubmitLabel,
  action,
  children,
  sx
}: TextResponseProps): ReactElement => {
  const { t } = useTranslation('libs-journeys-ui')

  const submitIcon = children.find((block) => block.id === submitIconId) as
    | TreeBlock<IconFields>
    | undefined

  const { variant } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const { blockHistory, treeBlocks } = useBlocks()
  const activeBlock = blockHistory[blockHistory.length - 1]

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
      : 'None'

  const router = useRouter()
  const [textResponseSubmissionEventCreate, { loading }] =
    useMutation<TextResponseSubmissionEventCreate>(
      TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
    )

  const initialValues: TextResponseFormValues = { response: '' }

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
          TagManager.dataLayer({
            dataLayer: {
              event: 'text_response_submission',
              eventId: id,
              blockId,
              stepName: heading
            }
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
    <Box sx={{ mb: 4 }}>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          if (selectedBlock === undefined) {
            void onSubmitHandler(values).then(() => {
              handleAction(router, action)
            })
          }
        }}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form data-testid={`textResponse-${blockId}`}>
            <Stack>
              <TextField
                id="textResponse-field"
                name="response"
                label={label}
                value={values.response}
                helperText={hint}
                multiline
                minRows={minRows ?? 3}
                onClick={(e) => e.stopPropagation()}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={selectedBlock !== undefined}
                inputProps={{ maxLength: 1000 }}
              />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading}
                size="large"
                startIcon={
                  submitIcon != null ? <Icon {...submitIcon} /> : undefined
                }
                onClick={(e) => e.stopPropagation()}
                sx={{ ...sx, mb: 0 }}
              >
                {editableSubmitLabel ?? submitLabel ?? t('Submit')}
              </LoadingButton>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
