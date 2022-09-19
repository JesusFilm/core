import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import { useRouter } from 'next/router'
import { useMutation, gql, ApolloError } from '@apollo/client'
import { SxProps } from '@mui/system/styleFunctionSx'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import { v4 as uuidv4 } from 'uuid'
import { useSnackbar } from 'notistack'
// import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import type { TreeBlock } from '../../libs/block'
// import { useBlocks } from '../../libs/block'
import { useEditor } from '../../libs/EditorProvider'
import { useJourney } from '../../libs/JourneyProvider'
import { handleAction } from '../../libs/action'
// import { getStepHeading } from '../../libs/getStepHeading'
import { TextField } from '../TextField'
import { Icon } from '../Icon'
import { IconFields } from '../Icon/__generated__/IconFields'
import { TextResponseSubmissionEventCreate } from './__generated__/TextResponseSubmissionEventCreate'
import { TextResponseFields } from './__generated__/TextResponseFields'

export const TEXT_RESPONSE_SUBMISSION_EVENT_CREATE = gql`
  mutation TextResponseSubmissionEventCreate(
    $input: TextResponseSubmissionEventCreateInput!
  ) {
    textResponseSubmissionEventCreate(input: $input) {
      id
      value
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
  submitIconId,
  // Use translated string when i18n is in
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

  const { admin } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  // const { activeBlock, treeBlocks } = useBlocks()

  // const heading =
  //   activeBlock != null
  //     ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
  //     : 'None'

  const router = useRouter()
  const [textResponseSubmissionEventCreate, { loading }] =
    useMutation<TextResponseSubmissionEventCreate>(
      TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
    )

  const initialValues: TextResponseFormValues = { response: '' }

  const onSubmitHandler = async (
    values: TextResponseFormValues
  ): Promise<void> => {
    if (!admin) {
      const id = uuid()
      try {
        await textResponseSubmissionEventCreate({
          variables: {
            input: {
              id,
              blockId,
              value: values.response
            }
          }
        })
        console.log('submission event created')
        // TagManager.dataLayer({
        //   dataLayer: {
        //     event: 'text_field_submission',
        //     eventId: id,
        //     blockId,
        //     stepName: heading
        //   }
        // })
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
        onSubmit={(values) => {
          if (selectedBlock === undefined) {
            void onSubmitHandler(values).then(() => {
              console.log('FINISHED SUBMISSION - Submit button click')
              handleAction(router, action)
            })
          }
        }}
      >
        {({ values, handleChange }) => (
          <Form
            data-testid={`textResponse-${blockId}`}
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <TextField
              data-testid="textResponse-field"
              id="textResponse-field"
              name="response"
              label={t('Your answer here')}
              value={values.response}
              onChange={handleChange}
              onBlur={(e) => {
                console.log('called onBlur')
                void onSubmitHandler(values).then(() => {
                  console.log('FINISHED SUBMISSION - onBlur')
                })
              }}
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
