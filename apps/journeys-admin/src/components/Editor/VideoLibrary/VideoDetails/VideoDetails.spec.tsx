import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEO } from '../VideoFromLocal/LocalDetails/LocalDetails'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { VideoDetails } from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VideoDetails', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

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
            primaryLanguageId: '529',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
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
                    __typename: 'Translation'
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ]

  it('should render details of a video', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VideoDetails
          id="2_Acts7302-0-0"
          source={VideoBlockSource.internal}
          open
          onClose={jest.fn()}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Jesus Taken Up Into Heaven' })
      ).toBeInTheDocument()
    )
    expect(getByText('Jesus promises the Holy Spirit.')).toBeInTheDocument()
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster')
    expect(imageTag).toHaveStyle(
      "background-image: url('https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg')"
    )
  })

  it('should close VideoDetails on close Icon click', () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <VideoDetails
          id="2_Acts7302-0-0"
          source={VideoBlockSource.internal}
          open
          onClose={onClose}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should open the languages drawer on language button click', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <VideoDetails
          id="2_Acts7302-0-0"
          source={VideoBlockSource.internal}
          open
          onClose={jest.fn()}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Other Languages' }))
    expect(getByText('Available Languages')).toBeInTheDocument()
  })

  it('should call onSelect and onClose on select click', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VideoDetails
          id="2_Acts7302-0-0"
          source={VideoBlockSource.internal}
          open
          onClose={onClose}
          onSelect={onSelect}
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
    expect(onClose).toHaveBeenCalledWith(false)
  })

  it('should call onClose on changeVideo click', () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              __typename: 'VideoBlock',
              id: 'video0.id',
              parentBlockId: '',
              parentOrder: 0,
              autoplay: false,
              startAt: 10,
              endAt: null,
              muted: null,
              posterBlockId: 'posterBlockId',
              fullsize: null,
              action: null,
              videoId: '2_0-FallingPlates',
              videoVariantLanguageId: '529',
              source: VideoBlockSource.internal,
              title: null,
              description: null,
              duration: null,
              image: null,
              video: {
                __typename: 'Video',
                id: '2_0-FallingPlates',
                title: [
                  {
                    __typename: 'Translation',
                    value: 'FallingPlates'
                  }
                ],
                image:
                  'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
                variant: {
                  __typename: 'VideoVariant',
                  id: '2_0-FallingPlates-529',
                  hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
                }
              },
              children: []
            }
          }}
        >
          <VideoDetails
            id="2_0-FallingPlates"
            source={VideoBlockSource.internal}
            open
            onClose={onClose}
            onSelect={onSelect}
            showChangeVideo
          />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Change Video' }))
    expect(onClose).toHaveBeenCalled()
  })
})
