import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { getLinkActionGoal } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useGoalDetails } from '@core/journeys/ui/useGoalDetails'

import { ActionFields_LinkAction as LinkAction } from '../../../../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/BlockFields'
import { MultipleLinkActionUpdate } from '../../../../../../../__generated__/MultipleLinkActionUpdate'
import { TextFieldForm } from '../../../../../TextFieldForm'

export const MULTIPLE_LINK_ACTION_UPDATE = gql`
  mutation MultipleLinkActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: LinkActionInput!
  ) {
    blockUpdateLinkAction(id: $id, journeyId: $journeyId, input: $input) {
      parentBlockId
      gtmEventName
      url
    }
  }
`

interface ActionEditorProps {
  url: string
  setSelectedAction?: (url: string) => void
}

export function ActionEditor({
  url,
  setSelectedAction
}: ActionEditorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const blocks = (journey?.blocks ?? [])
    .filter((block) => ((block as ButtonBlock).action as LinkAction) != null)
    .filter(
      (block) => ((block as ButtonBlock).action as LinkAction).url === url
    )

  const [linkActionUpdate] = useMutation<MultipleLinkActionUpdate>(
    MULTIPLE_LINK_ACTION_UPDATE
  )

  // check for valid URL
  function checkURL(value?: string): boolean {
    const protocol = /^\w+:\/\//
    let urlInspect = value ?? ''
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

  const linkActionSchema = object({
    link: string()
      .test('valid-url', t('Invalid URL'), checkURL)
      .required(t('Required'))
  })

  async function handleSubmit(src: string): Promise<void> {
    if (journey == null) return
    // checks if url has a protocol
    const url = /^\w+:\/\//.test(src) ? src : `https://${src}`
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
  }

  const goalType = getLinkActionGoal(url)
  const { label, icon } = useGoalDetails(goalType)

  return (
    <Box sx={{ pt: 6 }} data-testid="ActionEditor">
      <TextFieldForm
        id="link"
        label={t('Navigate to')}
        initialValue={url}
        validationSchema={linkActionSchema}
        onSubmit={handleSubmit}
      />
      <Stack gap={2} direction="row" alignItems="center" sx={{ pt: 3 }}>
        {icon}
        <Typography variant="subtitle2">{label}</Typography>
      </Stack>
    </Box>
  )
}
