import capitalize from 'lodash/capitalize'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import LinkIcon from '@core/shared/ui/icons/Link'
import SpaceHorizontalIcon from '@core/shared/ui/icons/SpaceHorizontal'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'
import { Icon, icons } from '../../Icon'

import { Color } from './Color'
import { Size } from './Size'
import { Variant } from './Variant'
import { useTranslation } from 'react-i18next'

export function Button({
  id,
  buttonVariant,
  buttonColor,
  size,
  startIconId,
  endIconId,
  action,
  children
}: TreeBlock<ButtonBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  const startIcon = children.find(
    (block) => block.id === startIconId
  ) as TreeBlock<IconFields>

  const endIcon = children.find(
    (block) => block.id === endIconId
  ) as TreeBlock<IconFields>

  const selectedAction = actions.find((act) => act.value === action?.__typename)

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-button-action`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Action'),
      children: <Action />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-button-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction?.label ?? t('None')}
        description={t('Action')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Action'),
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-button-color`}
        icon={<ColorDisplayIcon color={buttonColor} />}
        name={t('Color')}
        value={capitalize(buttonColor?.toString() ?? ButtonColor.primary)}
        description={t('Background Color')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Button Color'),
            mobileOpen: true,
            children: <Color />
          })
        }}
      />

      <Attribute
        id={`${id}-button-size`}
        icon={<SpaceHorizontalIcon />}
        name={t('Button Size')}
        value={capitalize(size?.toString() ?? ButtonSize.medium)}
        description={t('Button Size')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Button Size'),
            mobileOpen: true,
            children: <Size />
          })
        }}
      />

      <Attribute
        id={`${id}-button-variant`}
        icon={<TransformIcon />}
        name={t('Variant')}
        value={capitalize(buttonVariant?.toString() ?? ButtonVariant.contained)}
        description={t('Button Variant')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Button Variant'),
            mobileOpen: true,
            children: <Variant />
          })
        }}
      />

      <Attribute
        id={`${id}-button-leading-icon`}
        icon={<AlertCircleIcon />}
        name={t('Leading Icon')}
        value={
          icons.find(({ value }) => value === startIcon?.iconName)?.label ??
          t('None')
        }
        description={t('Leading Icon')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Leading Icon'),
            mobileOpen: true,
            children: <Icon id={startIcon.id} />
          })
        }}
      />

      <Attribute
        id={`${id}-button-trailing-icon`}
        icon={<AlertCircleIcon />}
        name={t('Trailing Icon')}
        value={
          icons.find(({ value }) => value === endIcon?.iconName)?.label ??
          t('None')
        }
        description={t('Trailing Icon')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Trailing Icon'),
            mobileOpen: true,
            children: <Icon id={endIcon.id} />
          })
        }}
      />
    </>
  )
}
