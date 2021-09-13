import { VideoOverlay } from './VideoOverlay'
import { renderWithStore } from '../../../../test/testingLibrary'
import { VideoOverlayType } from '../../../types'

const block: VideoOverlayType = {
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
    const { getByText } = renderWithStore(
      <VideoOverlay
        {...block}
        latestEvent={'ready'}
      />
    )
    expect(getByText('Chat Privately')).toBeInTheDocument()
  })
})
