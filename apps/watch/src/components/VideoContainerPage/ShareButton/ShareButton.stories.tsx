import { ComponentMeta, Story } from '@storybook/react'
import { noop } from 'lodash'
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

const Template: Story<typeof ShareButton> = () => (
  <>
    <ShareButton variant="icon" openDialog={noop} />
    <ShareButton variant="button" openDialog={noop} />
  </>
)

export const Default = Template.bind({})

export default ShareButtonStory
