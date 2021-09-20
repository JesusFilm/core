import { Story, Meta } from '@storybook/react'
import VideoOverlay from './VideoOverlay'
import { journeysConfig } from '../../../libs/storybook/decorators'
import {
  VideoEventEnum,
  VideoOverlayLocationEnum
} from '../../../../__generated__/globalTypes'
import { VideoOverlayProps } from '.'

const Demo = {
  ...journeysConfig,
  component: VideoOverlay,
  title: 'Journeys/Blocks/VideoOverlay'
}

const DefaultTemplate: Story<VideoOverlayProps> = ({ ...props }) => (
  <VideoOverlay {...props} latestEvent="READY" />
)

export const Default = DefaultTemplate.bind({})
Default.args = {
  __typename: 'VideoOverlayBlock',
  id: 'VideoOverlayss',
  displayOn: [VideoEventEnum.READY],
  location: VideoOverlayLocationEnum.CENTER,
  parentBlockId: 'Video',
  children: [
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question1',
      label: 'Question 1',
      description: '',
      parentBlockId: 'Video',
      children: [
        {
          id: 'NestedOptions',
          __typename: 'RadioOptionBlock',
          label: 'Chat Privately',
          parentBlockId: 'Question1'
        }
      ]
    }
  ]
}

export const Paused = DefaultTemplate.bind({})
Paused.args = {
  __typename: 'VideoOverlayBlock',
  id: 'VideoOverlay',
  displayOn: [VideoEventEnum.PAUSED],
  location: VideoOverlayLocationEnum.CENTER,
  parentBlockId: 'Video',
  children: [
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question1',
      label: 'Question 1',
      parentBlockId: 'Video',
      children: [
        {
          id: 'NestedOptions',
          __typename: 'RadioOptionBlock',
          label: 'Chat Privately',
          parentBlockId: 'Question1'
        }
      ]
    }
  ]
}

export default Demo as Meta
