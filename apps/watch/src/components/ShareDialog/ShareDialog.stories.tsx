import { ComponentStory, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { noop } from 'lodash'

import { GetVideo_video as Video } from '../../../__generated__/GetVideo'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/testData'
import { ShareDialog } from './ShareDialog'

const ShareDialogStory = {
  ...watchConfig,
  component: ShareDialog,
  title: 'Watch/ShareDialog',
  parameters: {
    theme: 'light'
  }
}

const video: Video = {
  ...videos[0],
  variant: {
    __typename: 'VideoVariant',
    duration: videos[0].variant?.duration ?? 0,
    hls: 'https://arc.gt/4jz75'
  },
  description: videos[0].snippet,
  episodes: [],
  variantLanguages: []
}

const Template: ComponentStory<typeof ShareDialog> = ({ ...args }) => {
  return <ShareDialog {...args} />
}

export const ShareLink = Template.bind({})
ShareLink.args = {
  open: true,
  onClose: noop,
  video
}
ShareLink.play = () => {
  userEvent.click(screen.getByRole('button', { name: 'Copy Link' }))
}

export const EmbedCode = Template.bind({})
EmbedCode.args = {
  open: true,
  onClose: noop,
  video
}
EmbedCode.play = () => {
  userEvent.click(screen.getByRole('tab', { name: 'Embed Code' }))
  userEvent.click(screen.getByRole('button', { name: 'Copy Embed Code' }))
}

export default ShareDialogStory as Meta
