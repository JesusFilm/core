import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { IntroText } from './IntroText'

const HomeHeroStory = {
  ...watchConfig,
  component: IntroText,
  title: 'Watch/IntroText',
  parameters: {
    fullscreen: true
  }
}

const Template: Story = () => <IntroText />

export const Default = Template.bind({})

export default HomeHeroStory as Meta
