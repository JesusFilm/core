import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { videos } from '../Videos/__generated__/testData'

import { GET_LANGUAGES, VideosPage } from './VideosPage'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

jest.mock('algoliasearch', () => {
  return jest.fn(() => ({
    initIndex: jest.fn(() => ({
      search: jest.fn(() => ({
        hits: [
          {
            videoId: '9_0-TheSavior',
            titles: ['The Savior'],
            description: [
              'The Savior provides an introduction to Jesus through the Gospel of Luke, during the time when Rome ruled much of the world. This was a time of political strife and social unrest, and it was into this environment that Jesus was born. Much is recorded in the Gospels but little is known about his quiet time of growing up in Nazareth. Later he teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping. The Savior is a fresh portrayal of the life of Jesus with dialogue taken directly from the Gospel of Luke. It follows Jesus from his upbringing to his death and resurrection.'
            ],
            duration: 7914,
            languageId: '496',
            subtitles: ['22658', '529'],
            slug: 'the-savior/french',
            label: 'shortFilm',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
            imageAlt: 'The Savior',
            childrenCount: 0,
            objectID: '9_496-0-TheSavior',
            _highlightResult: {
              titles: [
                {
                  value: 'The Savior',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              description: [
                {
                  value:
                    'The Savior provides an introduction to Jesus through the Gospel of Luke, during the time when Rome ruled much of the world. This was a time of political strife and social unrest, and it was into this environment that Jesus was born. Much is recorded in the Gospels but little is known about his quiet time of growing up in Nazareth. Later he teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping. The Savior is a fresh portrayal of the life of Jesus with dialogue taken directly from the Gospel of Luke. It follows Jesus from his upbringing to his death and resurrection.',
                  matchLevel: 'none',
                  matchedWords: []
                }
              ],
              languageId: {
                value: '496',
                matchLevel: 'none',
                matchedWords: []
              },
              subtitles: [
                { value: '22658', matchLevel: 'none', matchedWords: [] },
                { value: '529', matchLevel: 'none', matchedWords: [] }
              ]
            }
          }
        ],
        page: 0,
        nbPage: 1
      }))
    }))
  }))
})

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
        expect(push).toHaveBeenCalledWith('/videos?languages=496', undefined, {
          shallow: true
        })
      )
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
        expect(push).toHaveBeenCalledWith('/videos?subtitles=496', undefined, {
          shallow: true
        })
      )
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
          '/videos?title=The+Savior',
          undefined,
          {
            shallow: true
          }
        )
      )
    })
  })
})
