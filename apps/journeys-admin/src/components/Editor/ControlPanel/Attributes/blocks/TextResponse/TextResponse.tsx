import { ReactElement } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'

export function TextResponse(
  block: TreeBlock<TextResponseBlock>
): ReactElement {
  const { id } = block

  const { dispatch } = useEditor()

  const openDrawer = (): void =>
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Text Field Properties',
      mobileOpen: true,
      children: <></> // Add drawer compoent
    })
  return (
    <Attribute
      id={`${id}-text-field-options`}
      icon={<LinkRoundedIcon />} // change this when we find out icon
      name="Text Field"
      value={block?.id} // use block.label when the compoent is created
      description="Label and Hint text"
      onClick={openDrawer}
    />
  )
}
