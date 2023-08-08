import FormatShapesRoundedIcon from '@mui/icons-material/FormatShapesRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined'
import capitalize from 'lodash/capitalize'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Attribute } from '../..'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { Action, actions } from '../../Action/Action'
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
        icon={<LinkRoundedIcon />}
        name="Action"
        value={selectedAction?.label ?? 'None'}
        description="Action"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Action',
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-button-color`}
        icon={<ColorDisplayIcon color={buttonColor} />}
        name="Color"
        value={capitalize(buttonColor?.toString() ?? ButtonColor.primary)}
        description="Background Color"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Button Color',
            mobileOpen: true,
            children: <Color />
          })
        }}
      />

      <Attribute
        id={`${id}-button-size`}
        icon={<ViewDayOutlinedIcon />}
        name="Button Size"
        value={capitalize(size?.toString() ?? ButtonSize.medium)}
        description="Button Size"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Button Size',
            mobileOpen: true,
            children: <Size />
          })
        }}
      />

      <Attribute
        id={`${id}-button-variant`}
        icon={<FormatShapesRoundedIcon />}
        name="Variant"
        value={capitalize(buttonVariant?.toString() ?? ButtonVariant.contained)}
        description="Button Variant"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Button Variant ',
            mobileOpen: true,
            children: <Variant />
          })
        }}
      />

      <Attribute
        id={`${id}-button-leading-icon`}
        icon={<InfoOutlinedIcon />}
        name="Leading Icon"
        value={
          icons.find(({ value }) => value === startIcon?.iconName)?.label ??
          'None'
        }
        description="Leading Icon"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Leading Icon ',
            mobileOpen: true,
            children: <Icon id={startIcon.id} />
          })
        }}
      />

      <Attribute
        id={`${id}-button-trailing-icon`}
        icon={<InfoOutlinedIcon />}
        name="Trailing Icon"
        value={
          icons.find(({ value }) => value === endIcon?.iconName)?.label ??
          'None'
        }
        description="Trailing Icon"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Trailing Icon ',
            mobileOpen: true,
            children: <Icon id={endIcon.id} />
          })
        }}
      />
    </>
  )
}
