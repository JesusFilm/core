// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { videos } from '../Videos/__generated__/testData'
import { languages } from './testData'
import { VideosPage, GET_VIDEOS, limit, GET_LANGUAGES } from './VideosPage'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
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
      expect(getByTestId('videos-grid')).toBeInTheDocument()
    })
    it('should display videos', async () => {
      const { getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {},
                  offset: 0,
                  limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos
                }
              }
            }
          ]}
        >
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
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    it('should handle audio language filter', async () => {
      const { getByText, getByRole, getByTestId } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {},
                  offset: 0,
                  limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: [videos[0]]
                }
              }
            },
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages
                }
              }
            },
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: { availableVariantLanguageIds: ['4797'] },
                  offset: 0,
                  limit,
                  languageId: '4797'
                }
              },
              result: {
                data: {
                  videos: [videos[1]]
                }
              }
            }
          ]}
        >
          <VideosPage videos={[]} />
        </MockedProvider>
      )
      fireEvent.click(getByTestId('filter-item-languages'))
      const comboboxEl = getByRole('combobox', {
        name: 'Search Languages'
      })
      fireEvent.focus(comboboxEl)
      fireEvent.keyDown(comboboxEl, { key: 'ArrowDown' })
      await waitFor(() => getByRole('option', { name: 'Arabic' }))
      fireEvent.click(getByRole('option', { name: 'Arabic' }))
      expect(comboboxEl).toHaveValue('Arabic')
      await waitFor(() =>
        expect(getByText(videos[1].title[0].value)).toBeInTheDocument()
      )
      expect(push).toHaveBeenCalledWith('/videos?language=2', undefined, {
        shallow: true
      })
    })

    it('should handle subtitle language filter', async () => {
      const { getByText, getByTestId, getByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {},
                  offset: 0,
                  limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: [videos[0]]
                }
              }
            },
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages
                }
              }
            },
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: { sutitleLanguageIds: ['4797'] },
                  offset: 0,
                  limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: [videos[1]]
                }
              }
            }
          ]}
        >
          <VideosPage videos={[]} />
        </MockedProvider>
      )
      fireEvent.click(getByTestId('filter-item-subtitles'))
      const comboboxEl = getByRole('combobox', {
        name: 'Search Languages'
      })
      fireEvent.focus(comboboxEl)
      fireEvent.keyDown(comboboxEl, { key: 'ArrowDown' })
      await waitFor(() => getByRole('option', { name: 'Arabic' }))
      fireEvent.click(getByRole('option', { name: 'Arabic' }))
      expect(comboboxEl).toHaveValue('Arabic')
      await waitFor(() =>
        expect(getByText(videos[1].title[0].value)).toBeInTheDocument()
      )
      expect(push).toHaveBeenCalledWith('/videos?subtitle=2', undefined, {
        shallow: true
      })
    })

    it('should handle title filter', async () => {
      const { getByRole, getByText, getByTestId } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: {},
                  offset: 0,
                  limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: [videos[0]]
                }
              }
            },
            {
              request: {
                query: GET_LANGUAGES,
                variables: {
                  languageId: '529'
                }
              },
              result: {
                data: {
                  languages
                }
              }
            },
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: { title: 'JESUS' },
                  offset: 0,
                  limit,
                  languageId: '529'
                }
              },
              result: {
                data: {
                  videos: [videos[1]]
                }
              }
            }
          ]}
        >
          <VideosPage videos={[]} />
        </MockedProvider>
      )

      fireEvent.click(getByTestId('filter-item-title'))
      fireEvent.change(getByRole('textbox', { name: 'Search Titles' }), {
        target: { value: 'JESUS' }
      })
      await waitFor(() =>
        expect(getByText(videos[1].title[0].value)).toBeInTheDocument()
      )
      expect(push).toHaveBeenCalledWith('/videos?title=JESUS', undefined, {
        shallow: true
      })
    })
  })
})
