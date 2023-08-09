import { gql, useMutation } from '@apollo/client'
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { LinkActionUpdate } from '../../../../../../../__generated__/LinkActionUpdate'
import { TextFieldForm } from '../../../../../TextFieldForm'

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
      .required('Required')
      .test('valid-url', 'Invalid URL', checkURL)
  })

  async function handleSubmit(src: string): Promise<void> {
    // checks if url has a protocol
    const url = /^\w+:\/\//.test(src) ? src : `https://${src}`
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
      <TextFieldForm
        id="link"
        label="Paste URL here..."
        initialValue={linkAction?.url}
        validationSchema={linkActionSchema}
        onSubmit={handleSubmit}
        startIcon={
          <InputAdornment position="start">
            <InsertLinkRoundedIcon />
          </InputAdornment>
        }
      />
    </Box>
  )
}
