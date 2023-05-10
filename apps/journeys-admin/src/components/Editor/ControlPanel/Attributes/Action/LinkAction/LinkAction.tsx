import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import InputAdornment from '@mui/material/InputAdornment'
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded'
import Box from '@mui/material/Box'
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

interface LinkActionProps {
  action: string
}

export function LinkAction({ action }: LinkActionProps): ReactElement {
  console.log(action)
  const { state } = useEditor()
  const { journey } = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [linkActionUpdate] = useMutation<LinkActionUpdate>(LINK_ACTION_UPDATE)

  const linkAction =
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock.action
      : undefined

  const initialValues: LinkActionFormValues = { link: linkAction?.url ?? '' }

  // check for valid URL
  function checkURL(value?: string): boolean {
    let urlInspect = value ?? ''
    if (action === 'LinkAction') {
      const protocol = /^\w+:\/\//
      if (!protocol.test(urlInspect)) {
        if (/^mailto:/.test(urlInspect)) return false
        urlInspect = 'https://' + urlInspect
      }
      try {
        return new URL(urlInspect).toString() !== ''
      } catch (error) {
        return false
      }
    }
    if (action === 'EmailAction') {
      const protocol = /^mailto:/
      if (!protocol.test(urlInspect)) {
        if (/^\w+:\/\//.test(urlInspect)) return false
        urlInspect = 'mailto:' + urlInspect
        return true
      }
    }
    return false
  }

  const linkActionSchema = object({
    link: string()
      .required('Required')
      .test(
        'valid-url',
        () => {
          return action !== 'EmailAction' ? 'Invalid URL' : 'Invalid Email'
        },
        checkURL
      )
  })

  async function handleSubmit(src: string): Promise<void> {
    // checks if url has a protocol
    let url
    if (action === 'LinkAction') {
      url = /^\w+:\/\//.test(src) ? src : `https://${src}`
    }
    if (action === 'EmailAction') {
      url = /^mailto:/.test(src) ? src : `mailto:${src}`
    }
    if (selectedBlock != null && journey != null) {
      const { id, __typename: typeName } = selectedBlock
      await linkActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            url
          }
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
    <Box sx={{ pt: 8 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={linkActionSchema}
        onSubmit={async (values): Promise<void> => {
          await handleSubmit(values.link)
        }}
        enableReinitialize
      >
        {({ values, touched, errors, handleChange, handleBlur }) => (
          <Form>
            <TextField
              id="link"
              name="link"
              variant="filled"
              label={
                action === 'EmailAction'
                  ? 'Paste Email here...'
                  : 'Paste URL here...'
              }
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
                errors.link == null && handleSubmit(e.target.value)
              }}
              onChange={handleChange}
            />
          </Form>
        )}
      </Formik>
    </Box>
  )
}
