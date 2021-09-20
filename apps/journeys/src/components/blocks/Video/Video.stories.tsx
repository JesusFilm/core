import { Story, Meta } from '@storybook/react'
import { Video } from './'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { VideoEventEnum, VideoOverlayLocationEnum } from '../../../../__generated__/globalTypes'

const Demo = {
  ...journeysConfig,
  component: Video,
  title: 'Journeys/Blocks/Video'
}

const Template: Story<TreeBlock<VideoBlock>> = ({ ...props }) => <Video {...props} />

export const Default = Template.bind({})
Default.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
  parent: {
    id: 'Step1'
  }
}

export const OverlayOnPauseEnded = Template.bind({})
OverlayOnPauseEnded.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
  volume: 1,
  autoplay: false,
  children: [
    {
      __typename: 'VideoOverlayBlock',
      id: 'videooverlay',
      displayOn: [VideoEventEnum.PAUSED, VideoEventEnum.ENDED],
      parent: {
        id: 'Video1'
      },
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question1',
          label: 'show on',
          description: 'pause/ended',
          variant: 'light',
          parent: {
            id: 'Video1'
          },
          children: [
            {
              __typename: 'RadioOptionBlock',
              id: 'Option1',
              label: 'Chat Privately',
              parent: {
                id: 'Question1'
              }
            },
            {
              __typename: 'RadioOptionBlock',
              id: 'Option1',
              label: 'Get a bible',
              parent: {
                id: 'Question1'
              }
            }
          ]
        }
      ]
    }
  ],
  parent: {
    id: 'Step1'
  }
}

export const OverlayOnReadyPlay = Template.bind({})
OverlayOnReadyPlay.args = {
  __typename: 'VideoBlock',
  id: 'Video1',
  src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
  children: [
    {
      __typename: 'VideoOverlayBlock',
      id: 'videooverlay',
      displayOn: [VideoEventEnum.READY],
      location: VideoOverlayLocationEnum.CENTER,
      parent: {
        id: 'Video1'
      },
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'Question4321',
          label: 'appears',
          description: 'on ready',
          variant: 'light',
          parent: {
            id: 'Video1'
          },
          children: [
            {
              __typename: 'RadioOptionBlock',
              id: 'Option113',
              label: 'Chat maybe',
              parent: {
                id: 'Question4321'
              }
            },
            {
              __typename: 'RadioOptionBlock',
              id: 'Option1224',
              label: 'Get a thing',
              parent: {
                id: 'Question4321'
              }
            }
          ]
        }
      ]
    }
  ],
  parent: {
    id: 'Step1'
  }
}

export default Demo as Meta
