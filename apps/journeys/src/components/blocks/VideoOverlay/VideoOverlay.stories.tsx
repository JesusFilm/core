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
    description: '',
    children: [{
      id: 'NestedOptions',
      __typename: 'RadioOptionBlock',
      label: 'Chat Privately',
      parent: {
        id: 'Question1'
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
    __typename: 'RadioQuestionBlock',
    id: 'Question1',
    label: 'Question 1',
    children: [{
      id: 'NestedOptions',
      __typename: 'RadioOptionBlock',
      label: 'Chat Privately',
      parent: {
        id: 'Question1'
      }
    }]
  }]
}

export default Demo as Meta
