import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { noop } from 'lodash'

import { GetVideo_video as Video } from '../../../__generated__/GetVideo'
import { VideoType } from '../../../__generated__/globalTypes'

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
  studyQuestions: [],
  children: [],
  variantLanguages: []
}

const routes = ['the-story-of-jesus-for-children']

const Template: Story<ComponentProps<typeof ShareDialog>> = ({ ...args }) => {
  return <ShareDialog {...args} />
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onClose: noop,
  video: { ...video, type: VideoType.playlist },
  routes
}

export const ShareLink = Template.bind({})
ShareLink.args = {
  ...Basic.args,
  video
}
ShareLink.play = () => {
  userEvent.click(screen.getByRole('button', { name: 'Copy Link' }))
}

export const EmbedCode = Template.bind({})
EmbedCode.args = {
  ...ShareLink.args
}
EmbedCode.play = () => {
  userEvent.click(screen.getByRole('tab', { name: 'Embed Code' }))
  userEvent.click(screen.getByRole('button', { name: 'Copy Code' }))
}

export default ShareDialogStory as Meta
