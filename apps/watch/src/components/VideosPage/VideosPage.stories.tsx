import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videos } from '@core/watch/ui/testDataGenerator/__generated__/testData'

import { watchConfig } from '../../libs/storybook'

import { VideosPage } from './VideosPage'

const VideosStory: Meta<typeof VideosPage> = {
  ...watchConfig,
  component: VideosPage,
  title: 'Watch/VideosPage'
}

const Template: StoryObj<
  ComponentProps<typeof VideosPage> & { limit: number }
> = {
  render: () => {
    return <VideosPage videos={videos} />
  }
}

export const Default = {
  ...Template
}

export default VideosStory
