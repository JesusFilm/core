import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ReportSkeletonProps } from './ReportSkeleton'
import { ReportSkeleton } from '.'

const ReportSkeletonStory = {
  ...simpleComponentConfig,
  component: ReportSkeleton,
  title: 'Journeys-Admin/PowerBiReport/ReportSkeleton'
}

const Template: Story = ({ ...args }: ReportSkeletonProps) => (
  <ReportSkeleton {...args} />
)

export const Default = Template.bind({})
Default.args = {
  message: 'The analytics are loading'
}

export default ReportSkeletonStory as Meta
