import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { noop } from 'lodash'
import {
  VideoContentFields,
  VideoContentFields_children
} from '../../../__generated__/VideoContentFields'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'
import { ShareDialog } from './ShareDialog'

const ShareDialogStory = {
  ...watchConfig,
  component: ShareDialog,
  title: 'Watch/ShareDialog',
  parameters: {
    theme: 'light'
  }
}

const video: VideoContentFields = {
  ...videos[0],
  variant: {
    id: 'videoVariantId',
    __typename: 'VideoVariant',
    duration: videos[0].variant?.duration ?? 0,
    hls: 'https://arc.gt/4jz75',
    downloads: [],
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    slug: `${videos[0].slug}/english`,
    subtitle: [
      {
        __typename: 'Translation',
        language: {
          __typename: 'Language',
          bcp47: 'ar',
          id: '22658',
          name: [
            {
              __typename: 'Translation',
              value: ' اللغة العربية',
              primary: true
            },
            {
              __typename: 'Translation',
              value: 'Arabic, Modern Standard',
              primary: false
            }
          ]
        },
        value:
          'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
      }
    ]
  },
  description: videos[0].snippet,
  studyQuestions: [],
  children: [],
  childrenCount: 0
}

const routes = ['the-story-of-jesus-for-children']

const Template: Story<
  ComponentProps<typeof ShareDialog> & { video: VideoContentFields }
> = ({ ...args }) => {
  return (
    <VideoProvider value={{ content: args.video }}>
      <ShareDialog {...args} />
    </VideoProvider>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onClose: noop,
  video: {
    ...video,
    children: [{ id: '1' }] as unknown as VideoContentFields_children[]
  },
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
