import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GET_VIDEO } from '../../VideoFromLocal/LocalDetails/LocalDetails'
import { videos } from '../data'

import { VideoListItem } from './VideoListItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video List Item', () => {
  it('should render the content of VideoListItem', () => {
    const { getByText } = render(
      <MockedProvider>
        <VideoListItem {...videos[0]} onSelect={jest.fn()} />
      </MockedProvider>
    )
    expect(getByText("Andreas' Story")).toBeInTheDocument()
    expect(
      getByText(
        'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
      )
    ).toBeInTheDocument()
    expect(getByText('03:06')).toBeInTheDocument()
  })

  it('should open VideoDetails', async () => {
    const onSelect = jest.fn()
    const mocks = [
      {
        request: {
          query: GET_VIDEO,
          variables: {
            id: '2_Acts7302-0-0',
            languageId: '529'
          }
        },
        result: {
          data: {
            video: {
              id: '2_Acts7302-0-0',
              images: [
                {
                  mobileCinematicHigh:
                    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg'
                }
              ],
              primaryLanguageId: '529',
              title: [
                {
                  primary: true,
                  value: "Andreas' Story"
                }
              ],
              description: [
                {
                  primary: true,
                  value:
                    'After living a life full of fighter planes and porsches, Andreas realizes something is missing.'
                }
              ],
              variant: {
                id: 'variant-id',
                duration: 186,
                hls: 'https://example.com/video.m3u8'
              },
              variantLanguages: [
                {
                  id: '529',
                  slug: 'en',
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
        }
      }
    ]

    const { getByRole, getByText } = render(
      <MockedProvider mocks={mocks}>
        <VideoListItem {...videos[0]} onSelect={onSelect} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Video Details')).toBeInTheDocument())
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalled()
  })
})
