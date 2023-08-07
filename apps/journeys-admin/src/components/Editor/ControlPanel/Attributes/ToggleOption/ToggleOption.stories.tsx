import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { simpleComponentConfig } from '../../../../../libs/storybook'
import { Drawer } from '../../../Drawer'

import { ToggleOptionProps } from './ToggleOption'

import { ToggleOption } from '.'

const ToggleOptionStory = {
  ...simpleComponentConfig,
  component: ToggleOption,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/ToggleOption'
}

const Template: Story = ({ ...args }: ToggleOptionProps) => {
  return (
    <MockedProvider>
      <EditorProvider
        initialState={{
          drawerChildren: (
            <Box sx={{ p: 4 }}>
              <ToggleOption {...args} />
            </Box>
          ),
          drawerTitle: 'Title',
          drawerMobileOpen: true
        }}
      >
        <Drawer />
      </EditorProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  heading: 'Toggle Heading',
  checked: false,
  handleChange: noop
}

export const Filled = Template.bind({})
Filled.args = {
  heading: 'Toggle Heading',
  description: 'Toggle Description',
  checked: true,
  handleChange: noop,
  children: <Typography variant="caption">Children</Typography>
}

export default ToggleOptionStory as Meta
