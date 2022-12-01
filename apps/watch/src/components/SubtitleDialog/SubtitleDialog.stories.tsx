import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'

import { GetVideo_video as Video } from '../../../__generated__/GetVideo'
import { VideoType } from '../../../__generated__/globalTypes'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/testData'
import { SubtitleDialog } from './SubtitleDialog'

const SubtitleDialogStory = {
  ...watchConfig,
  component: SubtitleDialog,
  title: 'Watch/SubtitleDialog',
  parameters: {
    theme: 'light'
  }
}

const video: Video = {
  ...videos[0],
  variantLanguages: [
    {
      __typename: 'Language',
      id: '496',
      name: [
        { __typename: 'Translation', value: 'French' },
        { __typename: 'Translation', value: 'Français' }
      ]
    },
    {
      __typename: 'Language',
      id: '529',
      name: [{ __typename: 'Translation', value: 'English' }]
    },
    {
      __typename: 'Language',
      id: '584',
      name: [
        { __typename: 'Translation', value: 'Portuguese, Brazil' },
        { __typename: 'Translation', value: 'Português' }
      ]
    },
    {
      __typename: 'Language',
      id: '646',
      name: [
        { __typename: 'Translation', value: 'Armenian' },
        { __typename: 'Translation', value: 'Հայերեն' }
      ]
    },
    {
      __typename: 'Language',
      id: '1106',
      name: [
        { __typename: 'Translation', value: 'German, Standard' },
        { __typename: 'Translation', value: 'Deutsch' }
      ]
    }
  ],
  variant: {
    __typename: 'VideoVariant',
    duration: videos[0].variant?.duration ?? 0,
    hls: 'https://arc.gt/4jz75',
    language: { __typename: 'Language', id: '529', bcp47: 'en' },
    subtitle: [
      {
        __typename: 'Translation',
        language: {
          __typename: 'Language',
          bcp47: 'ar',
          id: '22658',
          iso3: 'arb',
          name: [
            { __typename: 'Translation', value: ' اللغة العربية' },
            { __typename: 'Translation', value: 'Arabic, Modern Standard' }
          ]
        },
        primary: false,
        value:
          'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
      }
    ]
  },
  description: videos[0].snippet,
  studyQuestions: [],
  episodes: []
}

const routes = ['the-story-of-jesus-for-children']

const Template: Story<ComponentProps<typeof SubtitleDialog>> = ({
  ...args
}) => {
  return <SubtitleDialog {...args} />
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  onClose: noop,
  video: { ...video, type: VideoType.playlist },
  routes
}

export default SubtitleDialogStory as Meta
