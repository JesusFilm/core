import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '../../libs/storybook'

import { StatusTabPanelProps } from './StatusTabPanel'

import { StatusTabPanel } from '.'

const StatusTabPanelStory = {
  ...journeysAdminConfig,
  component: StatusTabPanel,
  title: 'Journeys-Admin/StatusTabPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }: StatusTabPanelProps) => (
  <MockedProvider>
    <StatusTabPanel {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  activeList: <>Active List</>,
  archivedList: <>Archived List</>,
  trashedList: <>Trashed List</>,
  activeTabLoaded: true,
  setActiveEvent: noop,
  setSortOrder: noop
}

export default StatusTabPanelStory as Meta
