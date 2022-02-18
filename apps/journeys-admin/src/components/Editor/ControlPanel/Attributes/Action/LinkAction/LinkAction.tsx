import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui'
import { gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import { noop } from 'lodash'

export const LINK_ACTION_UPDATE = gql`
  mutation LinkActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: LinkActionInput!
  ) {
    blockUpdateLinkAction(id: $id, journeyId: $journeyId, input: $input) {
      id
      ... on ButtonBlock {
        action {
          ... on LinkAction {
            url
          }
        }
      }
    }
  }
`

interface LinkActionFormValues {
  link: string
}

export function LinkAction(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  console.log(selectedBlock)
  const linkAction =
    selectedBlock?.__typename === 'ButtonBlock' &&
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock.action
      : undefined

  const initialValues: LinkActionFormValues = { link: linkAction?.url ?? '' }

  const linkActionSchema = object().shape({
    link: string().url('Invalid URL').required('Required')
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={linkActionSchema}
      onSubmit={noop}
    >
      {({ values, touched, errors, handleChange, handleBlur }) => (
        <Form>
          <TextField
            id="link"
            name="link"
            placeholder="Paste URL here..."
            variant="filled"
            hiddenLabel
            fullWidth
            value={values.link}
            error={touched.link === true && Boolean(errors.link)}
            helperText={touched.link === true && errors.link}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        </Form>
      )}
    </Formik>
  )
}
