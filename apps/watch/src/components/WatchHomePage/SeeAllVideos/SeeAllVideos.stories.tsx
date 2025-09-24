import { Meta, StoryObj } from '@storybook/nextjs'

import { watchConfig } from '../../../libs/storybook/config'

import { SeeAllVideos } from './SeeAllVideos'

const SeeAllVideosStory: Meta<typeof SeeAllVideos> = {
  ...watchConfig,
  component: SeeAllVideos,
  title: 'Watch/VideoContainerPage/SeeAllVideos',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof SeeAllVideos> = {
  render: () => <SeeAllVideos />
}

export const Default = { ...Template }

export default SeeAllVideosStory
