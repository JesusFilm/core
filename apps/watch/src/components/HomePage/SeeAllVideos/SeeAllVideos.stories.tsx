import { ComponentStory, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook/config'
import { SeeAllVideos } from './SeeAllVideos'

const SeeAllVideosStory = {
  ...watchConfig,
  component: SeeAllVideos,
  title: 'Watch/VideoContainerPage/SeeAllVideos',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof SeeAllVideos> = ({ ...args }) => (
  <SeeAllVideos {...args} />
)

export const Default = Template.bind({})

Default.args = {
  value: '+53 Short Evangelical Films'
}

export default SeeAllVideosStory as Meta
