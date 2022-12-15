import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { VideoProvider } from '../../libs/videoContext'
import { watchConfig } from '../../libs/storybook'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { SubtitleDialog } from './SubtitleDialog'

const video = {
  variant: {
    __typename: 'VideoVariant',
    id: '1_529-jf-0-0',
    duration: 7674,
    hls: 'https://arc.gt/j67rz',
    language: {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    slug: 'jesus/english',
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
              primary: false
            },
            {
              __typename: 'Translation',
              value: 'Arabic, Modern Standard',
              primary: true
            }
          ]
        },
        value:
          'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
      }
    ]
  },
  slug: 'jesus',
  children: []
}

const SubtitleDialogStory = {
  ...watchConfig,
  component: SubtitleDialog,
  title: 'Watch/SubtitleDialog',
  parameters: {
    theme: 'light'
  }
}

const Template: Story<
  ComponentProps<typeof SubtitleDialog> & { video: VideoContentFields }
> = ({ ...args }) => {
  return (
    <VideoProvider value={{ content: args.video }}>
      <SubtitleDialog {...args} />
    </VideoProvider>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onClose: noop,
  video: video
}

export default SubtitleDialogStory as Meta
