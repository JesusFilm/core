import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import InputAdornment from '@mui/material/InputAdornment'
// import InsertEmailRoundedIcon from '@mui/icons-material/InsertEmailRounded'
import Box from '@mui/material/Box'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'

export const LINK_ACTION_UPDATE = gql`
  mutation EmailActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: EmailActionInput!
  ) {
    blockUpdateEmailAction(id: $id, journeyId: $journeyId, input: $input) {
      gtmEventName
      email
    }
  }
`

interface EmailActionFormValues {
  email: string
}

export function EmailAction(): ReactElement {
  const { state } = useEditor()
  const { journey } = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [emailActionUpdate] = useMutation(LINK_ACTION_UPDATE)

  const emailAction =
    selectedBlock?.action?.__typename === 'EmailAction'
      ? selectedBlock.action
      : undefined

  const initialValues: EmailActionFormValues = {
    email: emailAction?.email ?? ''
  }

  const emailActionSchema = object({
    email: string().required('Required').email('Invalid Email')
  })

  async function handleSubmit(src: string): Promise<void> {
    if (selectedBlock != null && journey != null) {
      const { id, __typename: typeName } = selectedBlock
      await emailActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            email: src
          }
        },
        update(cache, { data }) {
          if (data?.blockUpdateEmailAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => data.blockUpdateEmailAction
              }
            })
          }
        }
      })
    }
  }

  return (
    <Box sx={{ pt: 8 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={emailActionSchema}
        onSubmit={async (values): Promise<void> => {
          await handleSubmit(values.email)
        }}
        enableReinitialize
      >
        {({ values, touched, errors, handleChange, handleBlur }) => (
          <Form>
            <TextField
              id="email"
              name="email"
              variant="filled"
              label="Paste URL here..."
              fullWidth
              value={values.email}
              error={touched.email === true && Boolean(errors.email)}
              helperText={touched.email === true && errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {/* <InsertEmailRoundedIcon /> */}
                  </InputAdornment>
                )
              }}
              onBlur={(e) => {
                handleBlur(e)
                errors.email == null && handleSubmit(e.target.value)
              }}
              onChange={handleChange}
            />
          </Form>
        )}
      </Formik>
    </Box>
  )
}
