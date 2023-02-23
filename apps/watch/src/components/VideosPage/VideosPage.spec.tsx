// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
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
      const { getAllByRole, getByText, getByRole } = render(
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
                  languages: [
                    {
                      id: '529',
                      name: [
                        {
                          value: 'English',
                          primary: true
                        }
                      ]
                    }
                  ]
                }
              }
            },
            {
              request: {
                query: GET_VIDEOS,
                variables: {
                  where: { availableVariantLanguageIds: ['529'] },
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
          <VideosPage videos={videos} />
        </MockedProvider>
      )
      await waitFor(() =>
        expect(
          getAllByRole('combobox', { name: 'Search Languages' })[0]
        ).toBeInTheDocument()
      )
      const comboboxEl = getAllByRole('combobox', {
        name: 'Search Languages'
      })[0]
      fireEvent.focus(comboboxEl)
      fireEvent.keyDown(comboboxEl, { key: 'ArrowDown' })
      await waitFor(() => getByRole('option', { name: 'English' }))
      fireEvent.click(getByRole('option', { name: 'English' }))
      expect(comboboxEl).toHaveValue('English')
      await waitFor(() =>
        expect(getByText(videos[1].title[0].value)).toBeInTheDocument()
      )
    })

    it('should handle subtitle language filter', async () => {
      const { getAllByRole, getByText, getByTestId } = render(
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
                  where: { sutitleLanguageIds: ['529'] },
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

      const filterContainer = getByTestId('subtitleContainer')

      await act(async () => {
        await waitFor(() => fireEvent.click(filterContainer))

        const textbox = getAllByRole('combobox')[0]

        await waitFor(() => fireEvent.focus(textbox))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'ArrowDown' }))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'Enter' }))
      })
      expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
    })

    it('should handle title filter', async () => {
      const { getAllByRole, getByText } = render(
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
                  where: { sutitleLanguageIds: ['529'] },
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
      const textbox = getAllByRole('combobox')[0]
      await act(async () => {
        await waitFor(() => fireEvent.focus(textbox))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'J' }))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'E' }))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'S' }))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'U' }))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'S' }))
        await waitFor(() => fireEvent.keyDown(textbox, { key: 'Enter' }))
      })
      expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
    })
  })
})
