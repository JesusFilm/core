import { ReactElement, useState, ChangeEvent } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import TextField from '@mui/material/TextField'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'

export function NavigateLink(): ReactElement {
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const currentActionLink =
    selectedBlock?.action?.__typename === 'LinkAction'
      ? selectedBlock?.action?.url
      : ''

  const [link, setLink] = useState(currentActionLink)

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setLink(event.target.value)
  }

  // update mutation on un select to send link

  return (
    <TextField
      placeholder="Past URL here..."
      variant="filled"
      hiddenLabel
      value={link}
      onChange={handleChange}
    />
  )
}
