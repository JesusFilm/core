import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { journeysConfig } from '../../libs/storybook'
import {
  basic,
  imageBlocks,
  videoBlocks,
  videoLoop
} from '../../libs/testData/storyData'
import { Conductor, ConductorProps } from '.'

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ConductorProps> = ({ ...props }) => (
  <MockedProvider>
    <SnackbarProvider>
      <Conductor {...props} />
    </SnackbarProvider>
  </MockedProvider>
)

export const Default: Story<ConductorProps> = Template.bind({})
Default.args = {
  blocks: basic
}

export const WithContent: Story<ConductorProps> = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

export const WithVideo: Story<ConductorProps> = Template.bind({})
WithVideo.args = {
  blocks: videoBlocks
}
WithVideo.parameters = {
  chromatic: { delay: 100, diffThreshold: 0.2 }
}

export const WithVideoLoop: Story<ConductorProps> = Template.bind({})
WithVideoLoop.args = {
  blocks: videoLoop
}
WithVideoLoop.parameters = {
  chromatic: { delay: 100, diffThreshold: 0.2 }
}

export default Demo as Meta
