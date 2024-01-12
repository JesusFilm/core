import capitalize from 'lodash/capitalize'
import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { dispatch } = useEditor()
  const { t } = useTranslation()

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
      title: 'Action',
      children: <Action />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-button-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction?.label ?? 'None'}
        description={t('Action')}
        drawerTitle="Action"
      >
        <Action />
      </Attribute>

      <Attribute
        id={`${id}-button-color`}
        icon={<ColorDisplayIcon color={buttonColor} />}
        name={t('Color')}
        value={capitalize(buttonColor?.toString() ?? ButtonColor.primary)}
        description={t('Background Color')}
        drawerTitle={t('Button Color')}
      >
        <Color />
      </Attribute>

      {/* 
        adding t function
        const { t } = useTranslation()

        update name, description with t function

        add drawer title with t function
        - take the value from the dispatch.title

        moving the dispatch.children as a child to the attribute

        remove onClick
        */}
      <Attribute
        id={`${id}-button-size`}
        icon={<SpaceHorizontalIcon />}
        name={t('Button Size')}
        value={capitalize(size?.toString() ?? ButtonSize.medium)}
        description={t('Button Size')}
        drawerTitle={t('Button Size')}
      >
        <Size />
      </Attribute>

      <Attribute
        id={`${id}-button-variant`}
        icon={<TransformIcon />}
        name={t('Variant')}
        value={capitalize(buttonVariant?.toString() ?? ButtonVariant.contained)}
        description={t('Button Variant')}
        drawerTitle="Button Variant "
      >
        <Variant />
      </Attribute>

      <Attribute
        id={`${id}-button-leading-icon`}
        icon={<AlertCircleIcon />}
        name={t('Leading Icon')}
        value={
          icons.find(({ value }) => value === startIcon?.iconName)?.label ??
          'None'
        }
        description={t('Leading Icon')}
        drawerTitle="Leading Icon "
      >
        <Icon id={startIcon.id} />
      </Attribute>

      <Attribute
        id={`${id}-button-trailing-icon`}
        icon={<AlertCircleIcon />}
        name={t('Trailing Icon')}
        value={
          icons.find(({ value }) => value === endIcon?.iconName)?.label ??
          'None'
        }
        description={t('Trailing Icon')}
        drawerTitle="Trailing Icon "
      >
        <Icon id={endIcon.id} />
      </Attribute>
    </>
  )
}
