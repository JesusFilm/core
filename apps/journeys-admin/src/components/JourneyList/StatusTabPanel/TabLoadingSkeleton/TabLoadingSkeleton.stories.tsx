import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { TabLoadingSkeleton } from '.'

const TabLoadingSkeletonStory = {
  ...journeysAdminConfig,
  component: TabLoadingSkeleton,
  title: 'Journeys-Admin/JourneyList/StatusTabPanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const LoadingSkeleton: Story = () => {
  return <TabLoadingSkeleton />
}

export default TabLoadingSkeletonStory as Meta
