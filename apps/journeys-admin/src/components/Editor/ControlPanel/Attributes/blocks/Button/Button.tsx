import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import ViewDayOutlinedIcon from '@mui/icons-material/ViewDayOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FormatShapesRoundedIcon from '@mui/icons-material/FormatShapesRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import capitalize from 'lodash/capitalize'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
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
        id={`${id}-link-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={action?.__typename?.toString() ?? 'None'}
        description="Action"
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
        description="Background Color"
        // onClick open drawer
      />

      <Attribute
        id={`${id}-size`}
        icon={<ViewDayOutlinedIcon />}
        name="Button Size"
        value={capitalize(size?.toString() ?? 'medium')}
        description="Button Size"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-variant`}
        icon={<FormatShapesRoundedIcon />}
        name="Variant"
        value={capitalize(buttonVariant?.toString() ?? 'text')}
        description="Button Variant"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-start-icon`}
        icon={<InfoOutlinedIcon />}
        name="Leading Icon"
        // Add icon text in value
        value={startIcon?.name.toString() ?? 'None'}
        description="Leading Icon"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-end-icon`}
        icon={<InfoOutlinedIcon />}
        name="Trailing Icon"
        // Add icon text in value
        value={endIcon?.name.toString() ?? 'None'}
        description="Trailing Icon"
        // onClick to open drawer
      />
    </>
  )
}
