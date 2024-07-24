import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

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
  render: () => (
    <InstantSearchTestWrapper query="" indexName="video-variants-stg">
      <VideosPage />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template
}

export default VideosStory
