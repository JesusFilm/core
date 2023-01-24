// Note: some Carousel tests are missing currently due to an inability to mock the Carousel component.

import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from '../Videos/__generated__/testData'
import { languages } from './testData'
import { VideosPage, GET_VIDEOS, limit, GET_LANGUAGES } from './VideosPage'

describe('VideosPage', () => {
  describe('grid', () => {
    it('should render a grid', () => {
      const { getByTestId } = render(
        <MockedProvider>
          <VideosPage />
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
          <VideosPage />
        </MockedProvider>
      )
      await waitFor(() => {
        expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
        expect(getByText(videos[7].title[0].value)).toBeInTheDocument()
      })
    })
  })

  describe('filters', () => {
    it('should handle audio language filter', async () => {
      const { getAllByRole, getByText, getAllByTestId } = render(
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
                  where: { availableVariantLanguageIds: ['529'] },
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
          <VideosPage />
        </MockedProvider>
      )

      const textbox = getAllByRole('combobox')[0]
      await waitFor(() => fireEvent.focus(textbox))
      await waitFor(() => fireEvent.keyDown(textbox, { key: 'ArrowDown' }))
      const option = getAllByRole('option')[2]
      fireEvent.click(option)
      const chip = getByText('audio: English')
      expect(chip).toBeInTheDocument()
      fireEvent.click(getAllByTestId('CloseRoundedIcon')[0])
      expect(chip).not.toBeInTheDocument()
    })

    it('should handle subtitle language filter', async () => {
      const { getAllByRole, getByText, getAllByTestId } = render(
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
          <VideosPage />
        </MockedProvider>
      )

      const textbox = getAllByRole('combobox')[1]
      await waitFor(() => fireEvent.focus(textbox))
      await waitFor(() => fireEvent.keyDown(textbox, { key: 'ArrowDown' }))
      const option = getAllByRole('option')[2]
      fireEvent.click(option)
      const chip = getByText('sub: English')
      expect(chip).toBeInTheDocument()
      fireEvent.click(getAllByTestId('CloseRoundedIcon')[0])
      expect(chip).not.toBeInTheDocument()
    })
  })
})
