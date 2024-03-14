import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../../../../../libs/storybook'
import { DRAWER_WIDTH } from '../../../../../../constants'

import { HostInfo } from './HostInfo'

const Demo: Meta<typeof HostInfo> = {
  ...journeysAdminConfig,
  component: HostInfo,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/HostTab/HostInfo'
}

const handleSelection = jest.fn()

const Template: StoryObj<typeof HostInfo> = {
  render: () => {
    return (
      <MockedProvider>
        <Box sx={{ width: DRAWER_WIDTH }}>
          <HostInfo handleSelection={handleSelection} />
        </Box>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default Demo
