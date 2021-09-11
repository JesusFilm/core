import { Story, Meta } from '@storybook/react'
import { VideoOverlayType } from '../../../types'
import VideoOverlay from './VideoOverlay'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: VideoOverlay,
  title: 'Journeys/Blocks/VideoOverlay'
}

const DefaultTemplate: Story<VideoOverlayType> = ({ ...props }) => (
  <VideoOverlay {...props} latestEvent={'ready'} />
)

export const Default = DefaultTemplate.bind({})
Default.args = {
  id: 'VideoOverlay',
  displayOn: ['ready'],
  parent: {
    id: 'Video'
  },
  children: [{
    __typename: 'RadioQuestion',
    id: 'Question1',
    label: 'Question 1',
    children: [{
      id: 'NestedOptions',
      __typename: 'RadioOption',
      label: 'Chat Privately',
      parent: {
        id: 'MoreQuestions'
      }
    }]
  }]
}

export const Paused = DefaultTemplate.bind({})
Paused.args = {
  id: 'VideoOverlay',
  displayOn: ['paused'],
  parent: {
    id: 'Video'
  },
  children: [{
    __typename: 'RadioQuestion',
    id: 'Question1',
    label: 'Question 1',
    children: [{
      id: 'NestedOptions',
      __typename: 'RadioOption',
      label: 'Chat Privately',
      parent: {
        id: 'MoreQuestions'
      }
    }]
  }]
}

export default Demo as Meta
