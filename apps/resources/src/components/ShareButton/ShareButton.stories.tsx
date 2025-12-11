import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../libs/storybook'

import { ShareButton } from '.'

const ShareButtonStory: Meta<typeof ShareButton> = {
  ...watchConfig,
  component: ShareButton,
  title: 'Watch/ShareButton',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ShareButton> = {
  render: () => (
    <>
      <ShareButton variant="icon" onClick={noop} />
      <ShareButton variant="button" onClick={noop} />
    </>
  )
}

export const Default = { ...Template }

export default ShareButtonStory
