import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../../../constants'

import { HostListItem } from './HostListItem'

const HostListItemDemo: Meta<typeof HostListItem> = {
  ...journeysAdminConfig,
  component: HostListItem,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostList/HostListItem',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof HostListItem> = {
  render: ({ title, location, src1, src2 }) => (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <HostListItem
        id="hostId"
        title={title}
        location={location}
        src1={src1}
        src2={src2}
        onClick={noop}
      />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    title: `John "The Rock" Geronimo`,
    src1: 'https://tinyurl.com/3bxusmyb'
  }
}

export const Empty = {
  ...Template,
  args: {
    title: `John "The Rock" Geronimo`
  }
}

export const WithLocation = {
  ...Template,
  args: {
    ...Default.args,
    location: `Tokyo, Japan`
  }
}

export const TwoAvatars = {
  ...Template,
  args: {
    ...WithLocation.args,
    title: 'John G  & Siyang C',
    src2: 'https://tinyurl.com/3bxusmyb'
  }
}

export default HostListItemDemo
