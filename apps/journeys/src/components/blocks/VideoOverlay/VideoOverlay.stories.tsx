import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_VideoOverlayBlock as VideoOverlayBlock } from '../../../../__generated__/GetJourney'
import VideoOverlay from './VideoOverlay'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: VideoOverlay,
  title: 'Journeys/Blocks/VideoOverlay'
}

const DefaultTemplate: Story<VideoOverlayBlock> = ({ ...props }) => (
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
    parent: {
      id: 'Video'
    },
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
  location: 'flex-end',
  parent: {
    id: 'Video'
  },
  children: [{
    __typename: 'RadioQuestion',
    id: 'Question1',
    label: 'Question 1',
    parent: {
      id: 'Video'
    },
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
