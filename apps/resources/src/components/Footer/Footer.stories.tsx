import { Meta, StoryObj } from '@storybook/nextjs'

import { watchConfig } from '../../libs/storybook'

import { Footer } from '.'

const FooterStory: Meta<typeof Footer> = {
  ...watchConfig,
  component: Footer,
  title: 'Watch/Footer',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof Footer> = {
  render: () => <Footer />
}

export const Default = { ...Template }

export default FooterStory
