import { Meta, StoryObj } from '@storybook/react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { WatchHomePage } from '.'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'

const WatchHomePageStory: Meta<typeof WatchHomePage> = {
  ...watchConfig,
  component: WatchHomePage,
  title: 'Watch/WatchHomePage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof WatchHomePage> = {
  render: ({ ...args }) => (
    <InstantSearchTestWrapper query="" indexName="video-variants-stg">
      <WatchHomePage {...args} />
    </InstantSearchTestWrapper>
  )
}

export const Default = { ...Template, args: { videos } }

export default WatchHomePageStory
