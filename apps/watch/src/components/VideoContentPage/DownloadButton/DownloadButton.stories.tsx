import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook'

import { DownloadButton } from '.'

const DownloadButtonStory: Meta<typeof DownloadButton> = {
  ...watchConfig,
  component: DownloadButton,
  title: 'Watch/DownloadButton',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof DownloadButton> = {
  render: () => (
    <>
      <DownloadButton variant="icon" onClick={noop} />
      <DownloadButton variant="button" onClick={noop} />
    </>
  )
}
export const Default = { ...Template }

export default DownloadButtonStory
