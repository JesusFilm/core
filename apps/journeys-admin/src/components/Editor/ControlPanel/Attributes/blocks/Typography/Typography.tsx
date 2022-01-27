import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { Color } from './Color'
import { Align } from './Align'
import { Variant } from './Variant'

export function Typography(block: TreeBlock<TypographyBlock>): ReactElement {
  const { id, align, color, variant } = block

  const { dispatch } = useEditor()

  return (
    <>
      <Attribute
        id={`${id}-typography-color`}
        icon={<ColorDisplayIcon color={color} />}
        name="Color"
        value={capitalize(color?.toString() ?? 'primary')}
        description="Text Color"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Text Color',
            mobileOpen: true,
            children: <Color id={id} color={color} />
          })
        }}
      />

      <Attribute
        id={`${id}-typography-variant`}
        icon={<TextFieldsRoundedIcon />}
        name="Text Variant"
        value={capitalize(
          lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
        )}
        description="Text Variant"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Text Variant',
            mobileOpen: true,
            children: <Variant id={id} variant={variant} />
          })
        }}
      />

      <Attribute
        id={`${id}-typography-alignment`}
        icon={<FormatAlignLeftRoundedIcon />}
        name="Text Alignment"
        value={capitalize(align?.toString() ?? 'Left')}
        description="Text Alignment"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Text Alignment',
            mobileOpen: true,
            children: <Align id={id} align={align} />
          })
        }}
      />
    </>
  )
}
