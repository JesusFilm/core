import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import { useTranslation } from 'next-i18next'
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

  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-typography-variant`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Text Variant'),
      children: <Variant />
    })
  }, [dispatch, id, t])

  return (
    <>
      <Attribute
        id={`${id}-typography-variant`}
        icon={<Type2Icon />}
        name={t('Text Variant')}
        value={t(
          capitalize(
            lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
          )
        )}
        description={t('Text Variant')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Text Variant'),
            mobileOpen: true,
            children: <Variant />
          })
        }}
      />

      <Attribute
        id={`${id}-typography-color`}
        icon={<ColorDisplayIcon color={color} />}
        name={t('Color')}
        value={t(capitalize(color?.toString() ?? 'primary'))}
        description={t('Text Color')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Text Color'),
            mobileOpen: true,
            children: <Color />
          })
        }}
      />

      <Attribute
        id={`${id}-typography-alignment`}
        icon={<AlignLeftIcon />}
        name={t('Text Alignment')}
        value={t(capitalize(align?.toString() ?? 'Left'))}
        description={t('Text Alignment')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Text Alignment'),
            mobileOpen: true,
            children: <Align />
          })
        }}
      />
    </>
  )
}
