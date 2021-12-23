import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { journeysConfig } from '../../libs/storybook'
import { basic, imageBlocks, videoBlock } from './data'
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
    <Conductor {...props} />
  </MockedProvider>
)

const Default: Story<ConductorProps> = Template.bind({})
Default.args = {
  blocks: basic
}

const WithContent: Story<ConductorProps> = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

const WithVideoContent: Story<ConductorProps> = Template.bind({})
WithVideoContent.args = {
  blocks: videoBlock
}

export default Demo as Meta
export { Default, WithContent, WithVideoContent }
