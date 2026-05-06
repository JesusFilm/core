import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { StatusTabPanelProps } from './StatusTabPanel'

import { StatusTabPanel } from '.'

const StatusTabPanelStory: Meta<typeof StatusTabPanel> = {
  ...journeysAdminConfig,
  component: StatusTabPanel,
  title: 'Journeys-Admin/StatusTabPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof StatusTabPanel> = {
  render: ({ ...args }: StatusTabPanelProps) => (
    <MockedProvider>
      <StatusTabPanel {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    activeList: <>Active List</>,
    archivedList: <>Archived List</>,
    trashedList: <>Trashed List</>,
    activeTabLoaded: true,
    setActiveEvent: noop,
    setSortOrder: noop
  }
}

export default StatusTabPanelStory
