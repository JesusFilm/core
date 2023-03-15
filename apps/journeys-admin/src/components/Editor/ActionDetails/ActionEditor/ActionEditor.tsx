import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { Formik, Form } from 'formik'
import InputAdornment from '@mui/material/InputAdornment'
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded'
import TextField from '@mui/material/TextField'
import { noop } from 'lodash'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { gql, useMutation } from '@apollo/client'
import { object, string } from 'yup'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../__generated__/BlockFields'
import { ActionFields_LinkAction as LinkAction } from '../../../../../__generated__/ActionFields'
import { MultipleLinkActionUpdate } from '../../../../../__generated__/MultipleLinkActionUpdate'

export const MULTIPLE_LINK_ACTION_UPDATE = gql`
  mutation MultipleLinkActionUpdate(
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

interface ActionEditorProps {
  url: string
}

export function ActionEditor({ url }: ActionEditorProps): ReactElement {
  const { journey } = useJourney()

  const blocks = (journey?.blocks ?? [])
    .filter((block) => ((block as ButtonBlock).action as LinkAction) != null)
    .filter(
      (block) => ((block as ButtonBlock).action as LinkAction).url === url
    )

  const [linkActionUpdate] = useMutation<MultipleLinkActionUpdate>(
    MULTIPLE_LINK_ACTION_UPDATE
  )

  const linkActionSchema = object().shape({
    link: string().url('Invalid URL').required('Required')
  })

  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    if (journey == null) return
    const target = e.target as HTMLInputElement
    blocks.map(async (block) => {
      await linkActionUpdate({
        variables: {
          id: block.id,
          journeyId: journey.id,
          input: { url: target.value }
        },
        update(cache, { data }) {
          if (data?.blockUpdateLinkAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: block.__typename,
                id: block.id
              }),
              fields: {
                action: () => data.blockUpdateLinkAction
              }
            })
          }
        }
      })
    })
  }

  return (
    <Box sx={{ pt: 8 }}>
      <Formik
        initialValues={{
          link: url ?? ''
        }}
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
