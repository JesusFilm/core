import { ComponentMeta, ComponentStory } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { ShareButton } from '.'

const ShareButtonStory: ComponentMeta<typeof ShareButton> = {
  ...watchConfig,
  component: ShareButton,
  title: 'Watch/ShareButton',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof ShareButton> = () => <ShareButton />

export const Default = Template.bind({})

export default ShareButtonStory
