import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { AboutTabPanel } from './AboutTabPanel'

const AboutTabPanelStory: Meta<typeof AboutTabPanel> = {
  ...simpleComponentConfig,
  component: AboutTabPanel,
  title: 'Journeys-Admin/AboutTabPanel',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const Template: StoryObj<typeof AboutTabPanel> = {
  render: (args) => <AboutTabPanel {...args} />
}

export const Default = {
  ...Template,
  args: {
    name: 'strategySlug',
    errors: {},
    value: '',
    tabValue: 2,
    onChange: noop
  }
}

export const WithCanvaEmbed = {
  ...Template,
  args: {
    ...Default.args,
    value: 'https://www.canva.com/design/DAFvDBw1z1A/view'
  }
}

export const WithGoogleEmbed = {
  ...Template,
  args: {
    ...Default.args,
    value:
      'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
  }
}

export const Error = {
  ...Template,
  args: {
    ...Default.args,
    value: 'www.example.com',
    errors: { strategySlug: 'Invalid embed link' }
  }
}

export default AboutTabPanelStory
