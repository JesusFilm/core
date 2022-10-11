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

import { EmbeddedPreview, EmbeddedPreviewProps } from './EmbeddedPreview'

const Demo = {
  ...journeysConfig,
  component: EmbeddedPreview,
  title: 'Journeys/EmbeddedPreview',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<EmbeddedPreviewProps> = ({ ...props }) => (
  <MockedProvider>
    <EmbeddedPreview {...props} />
  </MockedProvider>
)

export const Default: Story<EmbeddedPreviewProps> = Template.bind({})
Default.args = {
  blocks: basic
}

export const WithContent: Story<EmbeddedPreviewProps> = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

export const WithVideo: Story<EmbeddedPreviewProps> = Template.bind({})
WithVideo.args = {
  blocks: videoBlocks
}

export const WithVideoNoPoster: Story<EmbeddedPreviewProps> = Template.bind({})
WithVideoNoPoster.args = {
  blocks: videoBlocksNoPoster
}

export const WithVideoNoVideo: Story<EmbeddedPreviewProps> = Template.bind({})
WithVideoNoVideo.args = {
  blocks: videoBlocksNoVideo
}

export const WithVideoLoop: Story<EmbeddedPreviewProps> = Template.bind({})
WithVideoLoop.args = {
  blocks: videoLoop
}

export default Demo as Meta
