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

export default Demo as Meta
