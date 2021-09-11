import { Story, Meta } from '@storybook/react'
import { VideoType } from '../../../types'
import { Video } from './'

import { Provider } from 'react-redux'
import { configureStoreWithState, RootState } from '../../../libs/store/store'
import { PreloadedState } from 'redux'

let preloadedState: PreloadedState<RootState>

const Demo = {
  component: Video,
  title: 'Journeys/Blocks/Video',
  decorators: [
    (Story) => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story />
      </Provider>
    )
  ]
}

const Template: Story<VideoType> = ({ ...props }) => <Video {...props} />

export const Default = Template.bind({})
Default.args = {
  __typename: 'Video',
  id: 'Video1',
  sources: [
    {
      src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
    }
  ],
  parent: {
    id: 'Step1'
  }
}

export const OverlayOnReady = Template.bind({})
OverlayOnReady.args = {
  __typename: 'Video',
  id: 'Video1',
  sources: [
    {
      src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
    }
  ],
  children: [
    {
      __typename: 'VideoOverlay',
      id: 'videooverlay',
      displayOn: 'paused',
      parent: {
        id: 'Video1'
      },
      children: [
        {
          __typename: 'RadioQuestion',
          id: 'Question1',
          label: 'Label',
          description: 'Description',
          variant: 'light',
          parent: {
            id: 'Video1'
          },
          children: [
            {
              __typename: 'RadioOption',
              id: 'Option1',
              label: 'Chat Privately',
              parent: {
                id: 'Question1'
              }
            },
            {
              __typename: 'RadioOption',
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

export const OverlayOnPause = Template.bind({})
OverlayOnPause.args = {
  __typename: 'Video',
  id: 'Video1',
  sources: [
    {
      src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
    }
  ],
  children: [
    {
      __typename: 'VideoOverlay',
      id: 'videooverlay',
      displayOn: 'paused',
      parent: {
        id: 'Video1'
      },
      children: [
        {
          __typename: 'RadioQuestion',
          id: 'Question3seconds',
          description: 'Question appears after 3 seconds',
          variant: 'light',
          parent: {
            id: 'Video1'
          },
          children: [
            {
              __typename: 'RadioOption',
              id: 'Option113',
              label: 'Chat maybe',
              parent: {
                id: 'Question1'
              }
            },
            {
              __typename: 'RadioOption',
              id: 'Option1224',
              label: 'Get a thing',
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

export default Demo as Meta
