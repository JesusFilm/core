import { ReactElement, useState, ChangeEvent, FocusEvent } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import { NavigateToLinkActionUpdate } from '../../../../../../../../../__generated__/NavigateToLinkActionUpdate'
import { useJourney } from '../../../../../../../../libs/context'

export const NAVIGATE_TO_LINK_ACTION_UPDATE = gql`
  mutation NavigateToLinkActionUpdate(
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

export function NavigateLink(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [navigateToLinkActionUpdate] = useMutation<NavigateToLinkActionUpdate>(
    NAVIGATE_TO_LINK_ACTION_UPDATE
  )

  const currentActionLink =
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock?.action?.url
      : ''

  const [link, setLink] = useState(currentActionLink)

  async function handleBlur(
    event: FocusEvent<HTMLInputElement>
  ): Promise<void> {
    if (selectedBlock != null) {
      await navigateToLinkActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { url: event.target.value }
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
    console.log('Url saved')
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setLink(event.target.value)
  }

  return (
    <TextField
      placeholder="Past URL here..."
      variant="filled"
      hiddenLabel
      value={link}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  )
}
