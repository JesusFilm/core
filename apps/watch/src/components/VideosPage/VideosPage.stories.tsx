import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

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
