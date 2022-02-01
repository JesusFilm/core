import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FormatShapesRoundedIcon from '@mui/icons-material/FormatShapesRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import capitalize from 'lodash/capitalize'
import {
  ButtonSize,
  ButtonColor,
  ButtonVariant
} from '../../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { ColorDisplayIcon } from '../../../ColorDisplayIcon'
import { Color } from './Color'
import { Size } from './Size'
import { Variant } from './Variant'
import { Icon } from './Icon'

export function Button({
  id,
  buttonVariant,
  buttonColor,
  size,
  startIcon,
  endIcon,
  action
}: TreeBlock<ButtonBlock>): ReactElement {
  const { dispatch } = useEditor()
  return (
    <>
      <Attribute
        id={`${id}-button-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={action?.__typename?.toString() ?? 'None'}
        description="Action"
        // onClick to open drawer
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
            children: <Color id={id} color={buttonColor} />
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
            children: <Size id={id} size={size} />
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
            children: <Variant id={id} variant={buttonVariant} />
          })
        }}
      />

      <Attribute
        id={`${id}-button-leading-icon`}
        icon={<InfoOutlinedIcon />}
        name="Leading Icon"
        value={startIcon?.name.toString() ?? 'None'}
        description="Leading Icon"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Leading Icon ',
            mobileOpen: true,
            children: (
              <Icon
                id={id}
                iconName={startIcon?.name}
                iconColor={startIcon?.color}
                iconSize={startIcon?.size}
              />
            )
          })
        }}
      />

      <Attribute
        id={`${id}-button-trailing-icon`}
        icon={<InfoOutlinedIcon />}
        name="Trailing Icon"
        value={endIcon?.name.toString() ?? 'None'}
        description="Trailing Icon"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Leading Icon ',
            mobileOpen: true,
            children: (
              <Icon
                id={id}
                iconName={endIcon?.name}
                iconColor={endIcon?.color}
                iconSize={endIcon?.size}
              />
            )
          })
        }}
      />
    </>
  )
}
