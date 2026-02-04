import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { GET_VIDEO } from '../../VideoFromLocal/LocalDetails/LocalDetails'
import { videos } from '../data'

import { VideoListItem } from './VideoListItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../../VideoDetails', () => ({
  __esModule: true,
  VideoDetails: ({ onSelect }: { onSelect: (block: any) => void }) => {
    onSelect({
      videoId: 'video-id',
      source: 'youTube',
      image: 'https://example.com/low.jpg'
    })
    return null
  }
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

  describe('handleSelect', () => {
    it('calls handleSelect with imageHigh when available', async () => {
      const handleSelect = jest.fn()

      const { getByTestId } = render(
        <MockedProvider>
          <VideoListItem
            id="video-id"
            title="Some title"
            description="Some description"
            image="https://example.com/low.jpg"
            imageHigh="https://example.com/high.jpg"
            duration={180}
            source={VideoBlockSource.youTube}
            onSelect={handleSelect}
          />
        </MockedProvider>
      )

      fireEvent.click(getByTestId('VideoListItem-video-id'))

      await waitFor(() =>
        expect(handleSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            videoId: 'video-id',
            image: 'https://example.com/high.jpg'
          })
        )
      )
    })

    it('handleSelect does not override image when imageHigh is not provided', async () => {
      const handleSelect = jest.fn()

      const { getByTestId } = render(
        <MockedProvider>
          <VideoListItem
            id="video-id"
            title="Some title"
            description="Some description"
            image="https://example.com/low.jpg"
            duration={180}
            source={VideoBlockSource.youTube}
            onSelect={handleSelect}
          />
        </MockedProvider>
      )

      fireEvent.click(getByTestId('VideoListItem-video-id'))

      await waitFor(() =>
        expect(handleSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            videoId: 'video-id',
            image: 'https://example.com/low.jpg'
          })
        )
      )
    })
  })

  xit('should open VideoDetails', async () => {
    // times out in jest 30
    const onSelect = jest.fn()
    const getVideoMock = {
      request: {
        query: GET_VIDEO,
        variables: {
          id: videos[0].id,
          languageId: '529'
        }
      },
      result: {
        data: {
          video: {
            id: videos[0].id,
            primaryLanguageId: '529',
            images: [
              {
                __typename: 'CloudflareImage',
                mobileCinematicHigh:
                  'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
              }
            ],
            title: [
              {
                primary: true,
                value: 'Jesus Taken Up Into Heaven'
              }
            ],
            description: [
              {
                primary: true,
                value: 'Jesus promises the Holy Spirit.'
              }
            ],
            variant: {
              id: 'variantA',
              duration: 144,
              hls: 'https://arc.gt/opsgn'
            },
            variantLanguages: [
              {
                __typename: 'Language',
                id: '529',
                name: [
                  {
                    value: 'English',
                    primary: true,
                    __typename: 'LanguageName'
                  }
                ]
              }
            ]
          }
        }
      }
    }
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getVideoMock]}>
        <VideoListItem {...videos[0]} onSelect={onSelect} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(getByText('Video Details')).toBeInTheDocument())
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalled()
  })
})
