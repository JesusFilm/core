import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { GET_VIDEO } from '../VideoFromLocal/LocalDetails/LocalDetails'

import { BLOCK_DELETE_FOR_COVER_IMAGE, VideoDetails } from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VideoDetails', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const imageBlock: TreeBlock<ImageBlock> = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    parentBlockId: 'videoBlockId',
    parentOrder: 0,
    src: 'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
    alt: 'Default Image Icon',
    width: 0,
    height: 0,
    blurhash: '',
    children: [],
    scale: null,
    focalLeft: 50,
    focalTop: 50
  }
  const videoBlock: TreeBlock<VideoBlock> = {
    id: 'videoBlockId',
    __typename: 'VideoBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    startAt: 0,
    endAt: null,
    muted: true,
    autoplay: true,
    fullsize: true,
    action: null,
    videoId: null,
    videoVariantLanguageId: null,
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    mediaVideo: null,
    posterBlockId: 'imageBlockId',
    objectFit: null,
    children: [imageBlock]
  }

  const getVideoMock = {
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
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_Acts7302-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
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

  it('should render details of a video', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getVideoMock]}>
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
    expect(sourceTag?.getAttribute('src')).toBe('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe(
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_Acts7302-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
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
    fireEvent.click(getByRole('button', { name: 'close-image-library' }))
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
    fireEvent.click(getByRole('button', { name: 'English' }))
    expect(getByText('Available Languages')).toBeInTheDocument()
  })

  it('should call onSelect select click', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const result = jest.fn().mockReturnValue(getVideoMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <VideoDetails
          id="2_Acts7302-0-0"
          source={VideoBlockSource.internal}
          open
          onClose={onClose}
          onSelect={onSelect}
        />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      duration: 144,
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
  })

  it('should call onClose on changeVideo click', () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getVideoMock]}>
        <VideoDetails
          id="2_0-FallingPlates"
          source={VideoBlockSource.internal}
          open
          onClose={onClose}
          onSelect={onSelect}
          activeVideoBlock={videoBlock}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Change Video' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should clear the video on delete icon click', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const result = jest.fn(() => ({
      data: {
        coverBlockImageDelete: {
          id: 'imageBlockId'
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_DELETE_FOR_COVER_IMAGE,
              variables: {
                blockDeleteId: imageBlock.id,
                journeyId: 'journeyId',
                parentBlockId: imageBlock.parentBlockId
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              selectedStep: {
                id: 'step0.id',
                __typename: 'StepBlock',
                parentBlockId: null,
                parentOrder: 0,
                locked: false,
                nextBlockId: 'step1.id',
                slug: null,
                children: [
                  {
                    id: 'card0.id',
                    __typename: 'CardBlock',
                    parentBlockId: 'step0.id',
                    coverBlockId: null,
                    parentOrder: 0,
                    backgroundColor: null,
                    themeMode: null,
                    themeName: null,
                    fullscreen: false,
                    backdropBlur: null,
                    children: [videoBlock]
                  }
                ]
              }
            }}
          >
            <VideoDetails
              id="2_0-FallingPlates"
              source={VideoBlockSource.internal}
              open
              onClose={onClose}
              onSelect={onSelect}
              activeVideoBlock={videoBlock}
            />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'clear-video' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onSelect).toHaveBeenCalledWith({
      source: VideoBlockSource.internal,
      videoId: null,
      posterBlockId: null,
      videoVariantLanguageId: null
    })
  })
})
