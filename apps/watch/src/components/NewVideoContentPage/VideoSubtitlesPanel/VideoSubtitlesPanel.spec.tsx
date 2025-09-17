import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { videos } from '../../Videos/__generated__/testData'
import { VideoProvider } from '../../../libs/videoContext'
import { WatchProvider } from '../../../libs/watchContext'
import { GET_SUBTITLES } from '../../../libs/watchContext/useSubtitleUpdate/useSubtitleUpdate'

import { VideoSubtitlesPanel } from './VideoSubtitlesPanel'

const englishSubtitleUrl = 'https://example.com/subtitles/english.vtt'
const spanishSubtitleUrl = 'https://example.com/subtitles/spanish.vtt'

const englishSubtitleResponse = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello world
`

const englishSubtitleMock = {
  request: {
    query: GET_SUBTITLES,
    variables: { id: 'jesus/english' }
  },
  result: {
    data: {
      video: {
        variant: {
          subtitle: [
            {
              language: {
                id: '529',
                bcp47: 'en',
                name: [{ value: 'English' }]
              },
              value: englishSubtitleUrl
            }
          ]
        }
      }
    }
  }
}

const multipleSubtitleMock = {
  request: {
    query: GET_SUBTITLES,
    variables: { id: 'jesus/english' }
  },
  result: {
    data: {
      video: {
        variant: {
          subtitle: [
            {
              language: {
                id: '529',
                bcp47: 'en',
                name: [{ value: 'English' }]
              },
              value: englishSubtitleUrl
            },
            {
              language: {
                id: '22658',
                bcp47: 'es',
                name: [{ value: 'Spanish' }]
              },
              value: spanishSubtitleUrl
            }
          ]
        }
      }
    }
  }
}

const originalFetch = global.fetch
const originalPointerEvent = window.PointerEvent
const originalHTMLElementMethods = {
  scrollIntoView: window.HTMLElement.prototype.scrollIntoView,
  releasePointerCapture: window.HTMLElement.prototype.releasePointerCapture,
  hasPointerCapture: window.HTMLElement.prototype.hasPointerCapture
}

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

function renderComponent(mocks = [englishSubtitleMock]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <VideoProvider value={{ content: videos[0] }}>
        <WatchProvider initialState={{ subtitleLanguageId: '529', subtitleOn: true }}>
          <VideoSubtitlesPanel />
        </WatchProvider>
      </VideoProvider>
    </MockedProvider>
  )
}

describe('VideoSubtitlesPanel', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: createMockPointerEvent as any
    })

    Object.assign(window.HTMLElement.prototype, {
      scrollIntoView: jest.fn(),
      releasePointerCapture: jest.fn(),
      hasPointerCapture: jest.fn()
    })

    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        text: async () => englishSubtitleResponse
      }) as unknown as typeof fetch
  })

  afterEach(() => {
    Object.assign(window.HTMLElement.prototype, originalHTMLElementMethods)
    Object.defineProperty(window, 'PointerEvent', {
      writable: true,
      value: originalPointerEvent
    })

    jest.clearAllMocks()
    if (originalFetch != null) global.fetch = originalFetch
  })

  it('renders subtitles when data is available', async () => {
    renderComponent()

    expect(screen.getByTestId('VideoSubtitlesPanel')).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Hello world')).toBeInTheDocument())
    expect(screen.getByText('0:01')).toBeInTheDocument()
  })

  it('allows selecting another subtitle language', async () => {
    const fetchMock = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.includes('spanish')) {
        return Promise.resolve({
          ok: true,
          text: async () => `WEBVTT\n\n00:00:02.000 --> 00:00:05.000\nHola mundo\n`
        })
      }

      return Promise.resolve({
        ok: true,
        text: async () => englishSubtitleResponse
      })
    }) as unknown as typeof fetch

    global.fetch = fetchMock

    renderComponent([multipleSubtitleMock])

    await waitFor(() => expect(screen.getByText('Hello world')).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByTestId('SubtitleLanguageSelectTrigger'))
    const spanishOption = await screen.findByRole('option', { name: 'Spanish' })
    await user.click(spanishOption)

    await screen.findByText('Hola mundo')
  })
})
