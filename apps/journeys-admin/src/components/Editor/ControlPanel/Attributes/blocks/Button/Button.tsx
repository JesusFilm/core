import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import ArrowDropDownCircleRoundedIcon from '@mui/icons-material/ArrowDropDownCircleRounded'
import ViewDayIcon from '@mui/icons-material/ViewDay'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FormatShapesRoundedIcon from '@mui/icons-material/FormatShapesRounded'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import capitalize from 'lodash/capitalize'
import { GetJourneyForEdit_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Attribute } from '../..'

export function Button({
  id,
  label,
  buttonVariant,
  buttonColor,
  size,
  startIcon,
  endIcon,
  action
}: TreeBlock<ButtonBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-size`}
        icon={<ViewDayIcon />}
        name="Size"
        value={capitalize(size?.toString() ?? 'medium')}
        description="Button Size"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-start-icon`}
        icon={<InfoOutlinedIcon />}
        name="Start Icon"
        value={startIcon?.name.toString() ?? 'None'}
        description="Button Start Icon"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-end-icon`}
        icon={<InfoOutlinedIcon />}
        name="End Icon"
        value={endIcon?.name.toString() ?? 'None'}
        description="Button End Icon"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-color`}
        icon={
          <Paper
            sx={{
              borderRadius: 1000
            }}
          >
            <Box
              data-testid="backgroundColorIcon"
              sx={{
                width: 20,
                height: 20,
                m: 1,
                borderRadius: 1000,
                backgroundColor: `${buttonColor ?? 'primary'}.main`
              }}
            />
          </Paper>
        }
        name="Color"
        value={capitalize(buttonColor?.toString() ?? 'primary')}
        description="Button Color"
        // onClick open drawer
      />
      {/* 
      <Attribute
        id={`${id}-label`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Label"
        value={label}
        description="Button Label"
        // onClick to open drawer
      /> */}

      <Attribute
        id={`${id}-variant`}
        icon={<FormatShapesRoundedIcon />}
        name="Variant"
        value={capitalize(buttonVariant?.toString() ?? 'text')}
        description="Button Variant"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-link-action`}
        // change icon
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Link Action"
        value={action?.__typename?.toString() ?? 'None'}
        description="Button Link Action"
        // onClick to open drawer
      />
    </>
  )
}
