import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { videos } from '../Videos/__generated__/testData'

import { VideosPage } from './VideosPage'

jest.mock('algoliasearch', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    initIndex: jest.fn().mockReturnValue({
      search: jest.fn().mockResolvedValue({
        hits: [
          {
            languageId: '496',
            subtitles: ['22658', '529', '496'],
            slug: 'the-savior/french',
            titles: ['The Savior'],
            label: 'shortFilm',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
            imageAlt: 'The Savior',
            childrenCount: 0,
            objectID: '9_496-0-TheSavior'
          }
        ],
        page: 0,
        nbPages: 1
      })
    })
  }))
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('VideosPage', () => {
  describe('grid', () => {
    it('should render a grid', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <VideosPage videos={videos} />
        </MockedProvider>
      )
      expect(getByTestId('VideoGrid')).toBeInTheDocument()
    })

    it('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider>
          <VideosPage videos={videos} />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
      })
    })
  })

  describe('filters', () => {
    let push: jest.Mock

    beforeEach(() => {
      push = jest.fn()
      mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
      jest.clearAllMocks()
    })

    it('should handle audio language filter', async () => {
      const { getByRole, getAllByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages: [
                    {
                      id: '496',
                      name: [
                        {
                          value: 'French',
                          primary: true
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]}
        >
          <VideosPage videos={[]} />
        </MockedProvider>
      )
      const comboboxEl = getAllByRole('combobox', {
        name: 'Search Languages'
      })[0]
      fireEvent.focus(comboboxEl)
      fireEvent.keyDown(comboboxEl, { key: 'ArrowDown' })
      await waitFor(() => getByRole('option', { name: 'French' }))
      fireEvent.click(getByRole('option', { name: 'French' }))
      expect(comboboxEl).toHaveValue('French')
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?languages=496',
          undefined,
          {
            shallow: true
          }
        )
      )
      expect(getByRole('heading', { name: 'The Savior' })).toBeInTheDocument()
    })

    it('should handle subtitle language filter', async () => {
      const { getByRole, getAllByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages: [
                    {
                      id: '496',
                      name: [
                        {
                          value: 'French',
                          primary: true
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]}
        >
          <VideosPage videos={[]} />
        </MockedProvider>
      )
      const comboboxEl = getAllByRole('combobox', {
        name: 'Search Languages'
      })[1]
      fireEvent.focus(comboboxEl)
      fireEvent.keyDown(comboboxEl, { key: 'ArrowDown' })
      await waitFor(() => getByRole('option', { name: 'French' }))
      fireEvent.click(getByRole('option', { name: 'French' }))
      expect(comboboxEl).toHaveValue('French')
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?subtitles=496',
          undefined,
          {
            shallow: true
          }
        )
      )
      expect(getByRole('heading', { name: 'The Savior' })).toBeInTheDocument()
    })

    it('should handle title filter', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <VideosPage videos={[]} />
        </MockedProvider>
      )
      fireEvent.change(getByRole('textbox', { name: 'Search Titles' }), {
        target: { value: 'The Savior' }
      })
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?title=The+Savior',
          undefined,
          {
            shallow: true
          }
        )
      )
      expect(getByRole('heading', { name: 'The Savior' })).toBeInTheDocument()
    })

    it('should disable load more button if there are no more local videos', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <VideosPage videos={videos} />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
      })
    })

    it('should disable load more button if there are no more algolia videos', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <VideosPage videos={[]} />
        </MockedProvider>
      )

      fireEvent.change(getByRole('textbox', { name: 'Search Titles' }), {
        target: { value: 'The Savior' }
      })
      await waitFor(() =>
        expect(push).toHaveBeenCalledWith(
          '/watch/videos?title=The+Savior',
          undefined,
          {
            shallow: true
          }
        )
      )
      expect(getByRole('heading', { name: 'The Savior' })).toBeInTheDocument()
      expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
    })
  })

  it('should not render header spacer', () => {
    render(
      <MockedProvider>
        <VideosPage videos={videos} />
      </MockedProvider>
    )
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })

  // TODO: add test for load more button
})
