import { ComponentProps, ReactElement } from 'react'
import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'

import { journeysConfig } from '../../libs/storybook'
import {
  basic,
  imageBlocks,
  videoBlocks,
  videoBlocksNoPoster,
  videoBlocksNoVideo,
  videoLoop
} from '../../libs/testData/storyData'

import { EmbeddedPreview } from './EmbeddedPreview'

const Demo = {
  ...journeysConfig,
  component: EmbeddedPreview,
  title: 'Journeys/EmbeddedPreview',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof EmbeddedPreview>> = ({
  ...args
}): ReactElement => (
  <MockedProvider>
    <EmbeddedPreview {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  blocks: basic
}

export const WithContent = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

export const WithVideo = Template.bind({})
WithVideo.args = {
  blocks: videoBlocks
}

export const WithVideoNoPoster = Template.bind({})
WithVideoNoPoster.args = {
  blocks: videoBlocksNoPoster
}

export const WithVideoNoVideo = Template.bind({})
WithVideoNoVideo.args = {
  blocks: videoBlocksNoVideo
}

export const WithVideoLoop = Template.bind({})
WithVideoLoop.args = {
  blocks: videoLoop
}

export default Demo as Meta
