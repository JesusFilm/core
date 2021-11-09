import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import Conductor, { ConductorProps } from '.'
import { basic, imageBlocks, videoBlock } from './data'
import { journeysConfig } from '../../libs/storybook'

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    layout: 'fullscreen',
    theme: 'light',
    chromatic: {
      viewports: [
        360, // Mobile (P)
        568, // Mobile (L)
        600, // Tablet (P)
        961, // Tablet (L)
        1200 // Laptop/Desktop
      ]
    }
  }
}

const Template: Story<ConductorProps> = ({ ...props }) => (
  <MockedProvider>
    <Conductor {...props} />
  </MockedProvider>
)

export const Default: Story<ConductorProps> = Template.bind({})
Default.args = {
  blocks: basic
}

export const DefaultOnDark: Story<ConductorProps> = Template.bind({})
DefaultOnDark.args = {
  blocks: basic
}
DefaultOnDark.parameters = {
  theme: 'dark'
}

export const WithContent: Story<ConductorProps> = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

export const WithContentOnDark: Story<ConductorProps> = Template.bind({})
WithContentOnDark.args = {
  blocks: imageBlocks
}
WithContentOnDark.parameters = {
  theme: 'dark'
}

export const WithVideoContent: Story<ConductorProps> = Template.bind({})
WithVideoContent.args = {
  blocks: videoBlock
}

export default Demo as Meta
