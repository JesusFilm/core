import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../../libs/useLanguages'
import { VideoPageProps, VideoProvider } from '../../../libs/videoContext'
import { WatchProvider } from '../../../libs/watchContext'
import { videos } from '../../Videos/__generated__/testData'

import { AudioLanguageSelect } from './AudioLanguageSelect'

jest.mock('../../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))
const useLanguagesMock = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

describe('AudioLanguageSelect', () => {
  const mockVideo = videos[0]
  const defaultProps: VideoPageProps = {
    content: mockVideo
  }

  const originalPointerEvent = window.PointerEvent

  // Store original HTMLElement prototype methods
  const originalHTMLElementMethods = {
    scrollIntoView: window.HTMLElement.prototype.scrollIntoView,
    releasePointerCapture: window.HTMLElement.prototype.releasePointerCapture,
    hasPointerCapture: window.HTMLElement.prototype.hasPointerCapture
  }

  // Mock PointerEvent and HTMLElement methods for shadcn/ui Select component testing
  // https://stackoverflow.com/questions/78975098/testing-shadcn-select-with-jest-and-react-testing-library | https://github.com/shadcn-ui/ui/discussions/4168#discussioncomment-10502077
  function createMockPointerEvent(
    type: string,
    props: PointerEventInit = {}
  ): PointerEvent {
    const event = new Event(type, props) as PointerEvent
    Object.assign(event, {
      button: props.button ?? 0,
      ctrlKey: props.ctrlKey ?? false,
      pointerType: props.pointerType ?? 'mouse'
    })
    return event
  }

  beforeEach(() => {
    // Mock PointerEvent globally - needed for shadcn/ui Select component testing
    // https://stackoverflow.com/questions/78975098/testing-shadcn-select-with-jest-and-react-testing-library | https://github.com/shadcn-ui/ui/discussions/4168#discussioncomment-10502077
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: createMockPointerEvent as any
    })

    // Mock HTMLElement methods globally - needed for shadcn/ui Select component testing
    // https://stackoverflow.com/questions/78975098/testing-shadcn-select-with-jest-and-react-testing-library | https://github.com/shadcn-ui/ui/discussions/4168#discussioncomment-10502077
    Object.assign(window.HTMLElement.prototype, {
      scrollIntoView: jest.fn(),
      releasePointerCapture: jest.fn(),
      hasPointerCapture: jest.fn()
    })
    jest.clearAllMocks()
    useLanguagesMock.mockReturnValue({
      isLoading: false,
      languages: [
        { id: '529', slug: 'english', displayName: 'English' },
        {
          id: '496',
          slug: 'french',
          displayName: 'French',
          nativeName: { value: 'Français', primary: true, id: '496' }
        },
        {
          id: '21028',
          slug: 'spanish',
          displayName: 'Spanish',
          nativeName: { value: 'Español', primary: true, id: '21028' }
        }
      ]
    })
  })

  afterEach(() => {
    // Restore original HTMLElement prototype methods
    Object.assign(window.HTMLElement.prototype, originalHTMLElementMethods)
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: originalPointerEvent
    })
  })

  it('should render the language selector with current language', async () => {
    render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={defaultProps}>
          <WatchProvider
            initialState={{
              audioLanguageId: '529',
              videoAudioLanguageIds: ['529', '496']
            }}
          >
            <AudioLanguageSelect />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    await userEvent.hover(screen.getByTestId('AudioLanguageSelectTrigger'))
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })
    expect(screen.getByText('2 Languages')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('AudioLanguageSelectTrigger'))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'French' })).toHaveTextContent(
        'French(Français)'
      )
    })
  })
})
