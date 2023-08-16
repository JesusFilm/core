import { ComponentMeta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook'

import { DownloadButton } from '.'

const DownloadButtonStory: ComponentMeta<typeof DownloadButton> = {
  ...watchConfig,
  component: DownloadButton,
  title: 'Watch/DownloadButton',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<typeof DownloadButton> = () => (
  <>
    <DownloadButton variant="icon" onClick={noop} />
    <DownloadButton variant="button" onClick={noop} />
  </>
)

export const Default = Template.bind({})

export default DownloadButtonStory
