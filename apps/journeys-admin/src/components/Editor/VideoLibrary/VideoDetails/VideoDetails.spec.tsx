import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, JourneyProvider, TreeBlock } from '@core/journeys/ui'
import { InMemoryCache } from '@apollo/client'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import {
  GET_VIDEO,
  VideoDetails,
  UPDATE_VIDEO_BLOCK_NEXT_STEP
} from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VideoDetails', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const selectedBlock: TreeBlock = {
    __typename: 'VideoBlock',
    id: 'video0.id',
    parentBlockId: 'card0.id',
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
    children: [
      {
        id: 'posterBlockId',
        __typename: 'ImageBlock',
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'random image from unsplash',
        width: 1600,
        height: 1067,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
        parentBlockId: 'video0.id',
        parentOrder: 0,
        children: []
      }
    ]
  }

  const selectedStep: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step0.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [selectedBlock]
      }
    ]
  }

  const mocks = [
    {
      request: {
        query: GET_VIDEO,
        variables: {
          id: '2_Acts7302-0-0'
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
            }
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
          open={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    expect(
      getByRole('heading', { name: 'Jesus Taken Up Into Heaven' })
    ).toBeInTheDocument()
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
          open={true}
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
          open={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Other Languages' }))
    expect(getByText('Language')).toBeInTheDocument()
  })

  it('should call onSelect and onClose on select click', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VideoDetails
          id="2_Acts7302-0-0"
          open={true}
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
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
    expect(onClose).toHaveBeenCalledWith()
  })

  it('updates video block next step block', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'VideoBlock:video0.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'VideoBlock:video0.id': {
        ...selectedBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToBlockAction: {
          id: selectedBlock.id,
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          blockId: 'step1.id'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          ...mocks,
          {
            request: {
              query: UPDATE_VIDEO_BLOCK_NEXT_STEP,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  blockId: 'step1.id'
                }
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ selectedStep, selectedBlock }}>
            <VideoDetails
              id="2_Acts7302-0-0"
              open={true}
              onClose={jest.fn()}
              onSelect={jest.fn()}
            />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['VideoBlock:video0.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      blockId: 'step1.id'
    })
  })
})
