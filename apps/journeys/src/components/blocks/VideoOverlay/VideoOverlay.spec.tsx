import { VideoOverlay } from './VideoOverlay'
import { renderWithApolloClient } from '../../../../test/testingLibrary'
import {
  RadioQuestionVariant,
  VideoEventEnum,
  VideoOverlayLocationEnum
} from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoOverlayBlock as VideoOverlayBlock } from '../../../../__generated__/GetJourney'

describe('VideoOverlay', () => {
  const block: TreeBlock<VideoOverlayBlock> = {
    __typename: 'VideoOverlayBlock',
    id: 'VideoOverlay',
    displayOn: [VideoEventEnum.READY, VideoEventEnum.PLAYED],
    location: VideoOverlayLocationEnum.CENTER,
    parentBlockId: 'Video',
    children: [
      {
        __typename: 'RadioQuestionBlock',
        id: 'Question1',
        label: 'Question 1',
        description: 'description',
        variant: RadioQuestionVariant.LIGHT,
        parentBlockId: 'Video',
        children: [
          {
            id: 'NestedOptions',
            __typename: 'RadioOptionBlock',
            label: 'Chat Privately',
            parentBlockId: 'Question1',
            action: null,
            children: []
          }
        ]
      }
    ]
  }

  it('should display radio option', () => {
    const { getByText } = renderWithApolloClient(
      <VideoOverlay {...block} latestEvent={'READY'} />
    )
    expect(getByText('Chat Privately')).toBeInTheDocument()
  })
})
