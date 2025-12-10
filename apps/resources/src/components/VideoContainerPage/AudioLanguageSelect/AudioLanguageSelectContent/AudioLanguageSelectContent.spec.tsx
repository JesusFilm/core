import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../../../libs/useLanguages'
import { VideoPageProps, VideoProvider } from '../../../../libs/videoContext'
import { WatchProvider } from '../../../../libs/watchContext'
import { Select, SelectTrigger } from '../../../Select'
import { videos } from '../../../Videos/__generated__/testData'

import { AudioLanguageSelectContent } from './AudioLanguageSelectContent'

jest.mock('../../../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))

const useLanguagesMock = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

describe('AudioLanguageSelectContent', () => {
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
  })

  afterEach(() => {
    // Restore original HTMLElement prototype methods
    Object.assign(window.HTMLElement.prototype, originalHTMLElementMethods)
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: originalPointerEvent
    })
  })

  it('should render language options with correct links', async () => {
    useLanguagesMock.mockReturnValue({
      isLoading: false,
      languages: [
        {
          id: '529',
          slug: 'english',
          displayName: 'English',
          nativeName: { id: '529', value: 'English', primary: true }
        },
        {
          id: '496',
          slug: 'french',
          displayName: 'French',
          nativeName: { id: '496', value: 'Français', primary: true }
        },
        {
          id: '21028',
          slug: 'spanish',
          displayName: 'Spanish',
          nativeName: { id: '21028', value: 'Español', primary: true }
        }
      ]
    })
    render(
      <MockedProvider mocks={[]}>
        <VideoProvider value={defaultProps}>
          <WatchProvider
            initialState={{ videoAudioLanguageIds: ['529', '496', '21028'] }}
          >
            <Select>
              <SelectTrigger data-testid="TestSelectTrigger">
                {'Test Select Trigger'}
              </SelectTrigger>
              <AudioLanguageSelectContent />
            </Select>
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    await userEvent.click(screen.getByTestId('TestSelectTrigger'))

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    await waitFor(() => {
      const [english, french, spanish] = screen.getAllByRole('option')
      expect(english).toHaveAttribute('href', '/watch/jesus.html/english.html')
      expect(
        within(english).queryByTestId('AudioLanguageSelectNativeLanguageName')
      ).not.toBeInTheDocument()
      expect(
        within(english).getByTestId('AudioLanguageSelectDisplayLanguageName')
      ).toHaveTextContent('English')
      expect(french).toHaveAttribute('href', '/watch/jesus.html/french.html')
      expect(
        within(french).getByTestId('AudioLanguageSelectNativeLanguageName')
      ).toHaveTextContent('Français')
      expect(
        within(french).getByTestId('AudioLanguageSelectDisplayLanguageName')
      ).toHaveTextContent('French')
      expect(spanish).toHaveAttribute('href', '/watch/jesus.html/spanish.html')
      expect(
        within(spanish).getByTestId('AudioLanguageSelectNativeLanguageName')
      ).toHaveTextContent('Español')
      expect(
        within(spanish).getByTestId('AudioLanguageSelectDisplayLanguageName')
      ).toHaveTextContent('Spanish')
    })
  })
})
