import { VideoOverlay } from './VideoOverlay'
import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { GetJourney_journey_blocks_VideoOverlayBlock as VideoOverlayBlock } from '../../../../__generated__/GetJourney'

const block: VideoOverlayBlock = {
  __typename: 'VideoOverlay',
  id: 'VideoOverlay1',
  displayOn: ['ready'],
  location: 'flex-start',
  children: [{
    __typename: 'RadioQuestion',
    id: 'Question1',
    label: 'Question 1',
    parent: {
      id: 'VideoOverlay1'
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

describe('VideoOverlay', () => {
  it('should display radio option', () => {
    const { getByText } = renderWithApolloClient(
      <VideoOverlay
        {...block}
        latestEvent={'ready'}
      />
    )
    expect(getByText('Chat Privately')).toBeInTheDocument()
  })
})
