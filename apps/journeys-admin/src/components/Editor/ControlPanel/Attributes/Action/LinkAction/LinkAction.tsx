import { ReactElement, useState, ChangeEvent, FocusEvent } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import { Button } from '@mui/material'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { LinkActionUpdate } from '../../../../../../../__generated__/LinkActionUpdate'
import { useJourney } from '../../../../../../libs/context'

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

export function LinkAction(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [linkActionUpdate] = useMutation<LinkActionUpdate>(LINK_ACTION_UPDATE)

  const currentActionLink =
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock?.action?.url
      : ''

  const [link, setLink] = useState(currentActionLink)

  async function handleBlur(
    event: FocusEvent
    // link: string
  ): Promise<void> {
    // if (selectedBlock != null && event.target.value !== '') {
    if (selectedBlock != null && link !== '') {
      await linkActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          // input: { url: event.target.value }
          input: { url: link }
        }
        // optimistic response causing cache issue
        // optimisticResponse: {
        //   blockUpdateLinkAction: {
        //     id: selectedBlock.id,
        //     __typename: 'ButtonBlock',
        //     action: {
        //       __typename: 'LinkAction',
        //       url: event.target.value
        //     }
        //   }
        // }
      })
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setLink(event.target.value)
  }

  const linkActionSchema = object().shape({
    // link: string().url('Invalid URL').required('Required')
    link: string().email('Invalid URL').required('Required')
  })

  return (
    <Formik
      initialValues={{ link: '' }}
      validationSchema={linkActionSchema}
      // validateOnBlur
      validateOnChange
      onSubmit={async (values) => {
        // return await Promise.resolve(values.link)
        return await Promise.resolve(null)
        // await handleBlur(values.link)
      }}
    >
      {({ ...formikProps }) => (
        <Form>
          <TextField
            {...formikProps}
            id="link"
            name="link"
            placeholder="Paste URL here..."
            variant="filled"
            hiddenLabel
            fullWidth
            onBlur={async (e) => {
              await handleBlur(e)
              formikProps.handleBlur(e)
            }}
            // value={link}
            // onBlur={handleBlur}
            // onChange={handleChange}
          />
          {/* {typeof errors.link === 'string' && <div>{errors.link}</div>} */}
          {/* <Button type="submit">Submit</Button> */}
        </Form>
      )}
    </Formik>
  )
}
