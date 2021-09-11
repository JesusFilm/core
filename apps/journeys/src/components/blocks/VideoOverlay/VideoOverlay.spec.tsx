import { VideoOverlay } from './VideoOverlay'
import { renderWithStore } from '../../../../test/testingLibrary'
import { VideoOverlayType } from '../../../types'

const block: VideoOverlayType = {
  __typename: 'VideoOverlay',
  id: 'VideoOverlay1',
  displayOn: ['ready'],
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

describe('VideoOverlay', () => {
  it('should display radio option', () => {
    const { getByText } = renderWithStore(
      <VideoOverlay
        {...block}
        latestEvent={'ready'}
      />
    )
    expect(getByText('Chat Privately')).toBeInTheDocument()
  })
})
