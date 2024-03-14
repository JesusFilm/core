import capitalize from 'lodash/capitalize'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import LinkIcon from '@core/shared/ui/icons/Link'
import SpaceHorizontalIcon from '@core/shared/ui/icons/SpaceHorizontal'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../controls/Action/Action'
import { ColorDisplayIcon } from '../../controls/ColorDisplayIcon'
import { Icon, icons } from '../../controls/Icon'

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
  const { t } = useTranslation('apps-journeys-admin')

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
      selectedAttributeId: `${id}-button-action`
    })
  }, [dispatch, id])

  return (
    <>
      <Accordion
        id={`${id}-button-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction?.label ?? 'None'}
      >
        <Action />
      </Accordion>

      <Accordion
        id={`${id}-button-color`}
        icon={<ColorDisplayIcon color={buttonColor} />}
        name={t('Color')}
        value={capitalize(buttonColor?.toString() ?? ButtonColor.primary)}
      >
        <Color />
      </Accordion>

      <Accordion
        id={`${id}-button-size`}
        icon={<SpaceHorizontalIcon />}
        name={t('Button Size')}
        value={capitalize(size?.toString() ?? ButtonSize.medium)}
      >
        <Size />
      </Accordion>

      <Accordion
        id={`${id}-button-variant`}
        icon={<TransformIcon />}
        name={t('Variant')}
        value={capitalize(buttonVariant?.toString() ?? ButtonVariant.contained)}
      >
        <Variant />
      </Accordion>

      <Accordion
        id={`${id}-button-leading-icon`}
        icon={<AlertCircleIcon />}
        name={t('Leading Icon')}
        value={
          icons.find(({ value }) => value === startIcon?.iconName)?.label ??
          'None'
        }
      >
        <Icon id={startIcon?.id} />
      </Accordion>

      <Accordion
        id={`${id}-button-trailing-icon`}
        icon={<AlertCircleIcon />}
        name={t('Trailing Icon')}
        value={
          icons.find(({ value }) => value === endIcon?.iconName)?.label ??
          'None'
        }
      >
        <Icon id={endIcon?.id} />
      </Accordion>
    </>
  )
}
