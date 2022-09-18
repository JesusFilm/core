import { ReactElement } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Crop169RoundedIcon from '@mui/icons-material/Crop169Rounded'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { TextField } from './TextField'

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
      children: <TextField />
    })
  return (
    <Attribute
      id={`${id}-text-field-options`}
      icon={<Crop169RoundedIcon />}
      name="Text Field"
      value="text-field-label" // use block.label when the component is created
      description="Label and Hint text"
      onClick={openDrawer}
    />
  )
}
