import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Attribute } from '../..'
import {
  FiberManualRecord,
  Image as ImageIcon,
  Palette,
  VerticalSplit
} from '@mui/icons-material'

export function Card({ id }: TreeBlock<CardBlock>): ReactElement {
  return (
    <>
      <Attribute
        icon={<FiberManualRecord />}
        name="Color"
        value={'Primary'}
        description="Background Color"
      />
      <Attribute
        icon={<ImageIcon />}
        name="Image"
        value={'SomeImageFileName.jpg'}
        description="Background Image"
      />
      <Attribute
        icon={<Palette />}
        name="Style"
        value={'Dark'}
        description="Card Styling"
      />
      <Attribute
        icon={<VerticalSplit />}
        name="Layout"
        value={'Contained'}
        description="Content Appearance"
      />
    </>
  )
}
