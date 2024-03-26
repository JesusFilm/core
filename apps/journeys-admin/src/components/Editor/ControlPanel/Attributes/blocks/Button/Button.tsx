import capitalize from 'lodash/capitalize'
import { useTranslation } from 'next-i18next'
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
  const selectedLeadingIcon = icons.find(
    ({ value }) => value === startIcon?.iconName
  )
  const selectedTrailingIcon = icons.find(
    ({ value }) => value === endIcon?.iconName
  )

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
  }, [dispatch, id, t])

  return (
    <>
      <Attribute
        id={`${id}-button-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={t(selectedAction?.label ?? 'None')}
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
        value={t(capitalize(buttonColor?.toString() ?? ButtonColor.primary))}
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
        value={t(capitalize(size?.toString() ?? ButtonSize.medium))}
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
        value={t(
          capitalize(buttonVariant?.toString() ?? ButtonVariant.contained)
        )}
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
        value={t(selectedLeadingIcon?.label ?? 'None')}
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
        value={t(selectedTrailingIcon?.label ?? 'None')}
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
