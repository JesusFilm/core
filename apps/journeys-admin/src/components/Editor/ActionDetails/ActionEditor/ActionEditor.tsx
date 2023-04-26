import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { Formik, Form } from 'formik'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { noop, startsWith } from 'lodash'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { gql, useMutation } from '@apollo/client'
import { object, string } from 'yup'
import Typography from '@mui/material/Typography'
import EditRounded from '@mui/icons-material/EditRounded'
import QuestionAnswerOutlined from '@mui/icons-material/QuestionAnswerOutlined'
import WebOutlined from '@mui/icons-material/WebOutlined'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import Stack from '@mui/material/Stack'
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
  goalLabel?: (url: string) => string
  setSelectedAction?: (url: string) => void
}

export function ActionEditor({
  url,
  goalLabel,
  setSelectedAction
}: ActionEditorProps): ReactElement {
  const { journey } = useJourney()

  const blocks = (journey?.blocks ?? [])
    .filter((block) => ((block as ButtonBlock).action as LinkAction) != null)
    .filter(
      (block) => ((block as ButtonBlock).action as LinkAction).url === url
    )

  const [linkActionUpdate] = useMutation<MultipleLinkActionUpdate>(
    MULTIPLE_LINK_ACTION_UPDATE
  )

  const linkActionSchema = object({
    link: string().url('Invalid URL').required('Required')
  })

  // ^(?!mailto:)((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$
  async function handleSubmit(e: React.FocusEvent): Promise<void> {
    if (journey == null) return
    const target = e.target as HTMLInputElement
    const url = target.value
    // const formattedUrl = startsWith(url, 'https')
    //   ? url
    //   : startsWith(url, 'http')
    //   ? url
    //   : 'https://' + url
    blocks.map(async (block) => {
      await linkActionUpdate({
        variables: {
          id: block.id,
          journeyId: journey.id,
          input: {
            url
          }
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
    setSelectedAction?.(url)
    goalLabel?.(url)
  }

  let icon: ReactNode
  switch (goalLabel?.(url)) {
    case 'Start a Conversation':
      icon = <QuestionAnswerOutlined sx={{ color: 'secondary.light' }} />
      break
    case 'Link to Bible':
      icon = <MenuBookRounded sx={{ color: 'secondary.light' }} />
      break
    default:
      icon = <WebOutlined sx={{ color: 'secondary.light' }} />
      break
  }

  return (
    <Box sx={{ pt: 6 }} data-testid="ActionEditor">
      <Formik
        initialValues={{
          link: url ?? ''
        }}
        validationSchema={linkActionSchema}
        onSubmit={noop}
        enableReinitialize
      >
        {({
          values,
          touched,
          errors,
          handleChange,
          handleBlur,
          setFieldValue
        }) => (
          <Form>
            <TextField
              id="link"
              name="link"
              variant="filled"
              label="Navigate to"
              fullWidth
              value={values.link}
              error={touched.link === true && Boolean(errors.link)}
              helperText={touched.link === true && errors.link}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EditRounded sx={{ color: 'divider' }} />
                  </InputAdornment>
                )
              }}
              onBlur={(e) => {
                handleBlur(e)
                // if (!startsWith(e.target.value, 'https')) {
                //   setFieldValue('link', 'https://' + e.target.value)
                // }
                errors.link == null && handleSubmit(e)
              }}
              onChange={handleChange}
            />
          </Form>
        )}
      </Formik>
      <Stack gap={2} direction="row" alignItems="center" sx={{ pt: 2.5 }}>
        {icon}
        <Typography variant="subtitle2">{goalLabel?.(url)}</Typography>
      </Stack>
    </Box>
  )
}
