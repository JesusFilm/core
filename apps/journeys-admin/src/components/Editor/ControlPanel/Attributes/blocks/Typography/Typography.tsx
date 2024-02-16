import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import Type2Icon from '@core/shared/ui/icons/Type2'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../__generated__/GetJourney'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { Attribute } from '../../Attribute'

import { Align } from './Align'
import { Color } from './Color'
import { Variant } from './Variant'

export function Typography(block: TreeBlock<TypographyBlock>): ReactElement {
  const { id, align, color, variant } = block

  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-typography-variant`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Text Variant',
      children: <Variant />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-typography-variant`}
        icon={<Type2Icon />}
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
            children: <Variant />
          })
        }}
      />

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
            children: <Color />
          })
        }}
      />

      <Attribute
        id={`${id}-typography-alignment`}
        icon={<AlignLeftIcon />}
        name="Text Alignment"
        value={capitalize(align?.toString() ?? 'Left')}
        description="Text Alignment"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Text Alignment',
            mobileOpen: true,
            children: <Align />
          })
        }}
      />
    </>
  )
}
