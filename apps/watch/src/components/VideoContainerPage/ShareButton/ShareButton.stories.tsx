import { ComponentMeta, ComponentStory } from '@storybook/react'
import { noop } from 'lodash'
import { watchConfig } from '../../../libs/storybook'
import { ShareButton } from '.'

const icon = 'icon'
const button = 'button'

const ShareButtonStory: ComponentMeta<typeof ShareButton> = {
  ...watchConfig,
  component: ShareButton,
  title: 'Watch/ShareButton',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof ShareButton> = ({ ...args }) => (
  <>
    <ShareButton variant="icon" openDialog={noop} />
    <ShareButton variant="button" openDialog={noop} />
  </>
)

export const Default = Template.bind({})
Default.args = {
  icon,
  button
}

export default ShareButtonStory
