import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostInfo } from './HostInfo'

const Demo: Meta<typeof HostInfo> = {
  ...journeysAdminConfig,
  component: HostInfo,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Footer/Host/HostInfo'
}

const Template: StoryObj<ComponentProps<typeof HostInfo>> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <Box sx={{ width: DRAWER_WIDTH }}>
          <HostInfo {...args} />
        </Box>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  componentProps: {
    handleSelection: fn()
  }
}

export default Demo
