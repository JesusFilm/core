import { ReactElement } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import { noop } from 'lodash'
import InputAdornment from '@mui/material/InputAdornment'
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded'
import { useJourney } from '../../../../../../libs/context'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { LinkActionUpdate } from '../../../../../../../__generated__/LinkActionUpdate'

export const LINK_ACTION_UPDATE = gql`
  mutation LinkActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: LinkActionInput!
  ) {
    blockUpdateLinkAction(id: $id, journeyId: $journeyId, input: $input) {
      gtmEventName
      url
    }
  }
`

interface LinkActionFormValues {
  link: string
}

export function LinkAction(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [linkActionUpdate] = useMutation<LinkActionUpdate>(LINK_ACTION_UPDATE)

  const linkAction =
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock.action
      : undefined

  const initialValues: LinkActionFormValues = { link: linkAction?.url ?? '' }

  const linkActionSchema = object().shape({
    link: string().url('Invalid URL').required('Required')
  })

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    if (selectedBlock != null) {
      const { id, __typename: typeName } = selectedBlock
      await linkActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { url: target.value }
        },
        update(cache, { data }) {
          if (data?.blockUpdateLinkAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => data.blockUpdateLinkAction
              }
            })
          }
        }
      })
    }
  }

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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <InsertLinkRoundedIcon />
                </InputAdornment>
              )
            }}
            onBlur={(e) => {
              handleBlur(e)
              errors.link == null && handleSubmit(e)
            }}
            onChange={handleChange}
          />
        </Form>
      )}
    </Formik>
  )
}
