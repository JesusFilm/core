import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import { noop } from 'lodash'
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

export function LinkAction(): ReactElement {
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

  const urlRegex =
    /^(?=.{4,2048}$)((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]{1,63}(\.[a-zA-Z]{1,63}){1,5}(\/)?.([\w?[a-zA-Z-_%/@?]+)*([^/\w?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/

  const linkActionSchema = object({
    link: string().matches(urlRegex, 'Invalid URL').required('Required')
  })

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    const target = e.target as HTMLInputElement
    if (selectedBlock != null && journey != null) {
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
    <Box sx={{ pt: 8 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={linkActionSchema}
        onSubmit={noop}
        enableReinitialize
      >
        {({ values, touched, errors, handleChange, handleBlur }) => (
          <Form>
            <TextField
              id="link"
              name="link"
              variant="filled"
              label="Paste URL here..."
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
    </Box>
  )
}
