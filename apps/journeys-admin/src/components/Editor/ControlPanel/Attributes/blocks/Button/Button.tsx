import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import ArrowDropDownCircleRoundedIcon from '@mui/icons-material/ArrowDropDownCircleRounded'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
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
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Size"
        value={size?.toString() ?? 'None'}
        description="Button Size"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-start-icon`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Start Icon"
        value={startIcon?.toString() ?? 'None'}
        description="Button Start Icon"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-end-icon`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="End Icon"
        value={endIcon?.toString() ?? 'None'}
        description="Button End Icon"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-color`}
        icon={
          <Paper sx={{ borderRadius: 1000, overflow: 'hidden' }}>
            <Box
              data-testid="backgroundColorIcon"
              sx={{
                width: 25,
                height: 25,
                m: 1,
                borderRadius: 1000,
                backgroundColor: (theme) =>
                  buttonColor ?? theme.palette.text.primary
              }}
            />
          </Paper>
        }
        name="Color"
        value={buttonColor?.toString() ?? 'None'}
        description="Button Color"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-label`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Label"
        value={label}
        description="Button Label"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-variant`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Variant"
        value={buttonVariant?.toString() ?? 'None'}
        description="Button Variant"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-link-action`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Link Action"
        value={action?.toString() ?? 'None'}
        description="Button Link Action"
        // onClick to open drawer
      />
    </>
  )
}
