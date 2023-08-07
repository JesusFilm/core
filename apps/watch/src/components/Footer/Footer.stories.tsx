import { Meta, Story } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'

import { Footer } from '.'

const FooterStory = {
  ...watchConfig,
  component: Footer,
  title: 'Watch/Footer',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => <Footer />

export const Default = Template.bind({})

export default FooterStory as Meta
