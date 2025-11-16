import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { NextRouter, useRouter } from 'next/router'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { MuxVideoUploadProvider } from '../../../../../../MuxVideoUploadProvider'
import { videoItems } from '../../VideoLibrary/data'
import { GET_VIDEO } from '../../VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'

import { GET_VIDEO_VARIANT_LANGUAGES } from './SourceFromLocal/SourceFromLocal'

import { Source } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>

const getVideoMock = {
  request: {
    query: GET_VIDEO,
    variables: {
      id: 'videoId',
      languageId: '529'
    }
  },
  result: {
    data: {
      video: {
        id: 'videoId',
        images: [
          {
            __typename: 'CloudflareImage',
            mobileCinematicHigh:
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
          }
        ],
        primaryLanguageId: '529',
        title: [
          {
            primary: true,
            value: 'Jesus Taken Up Into Heaven'
          }
        ],
        description: [
          {
            primary: true,
            value:
              'Jesus promises the Holy Spirit; then ascends into the clouds.'
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

const getVideoVariantLanguagesMock = {
  request: {
    query: GET_VIDEO_VARIANT_LANGUAGES,
    variables: {
      id: 'videoId'
    }
  },
  result: {
    data: {
      video: {
        id: 'videoId',
        variant: {
          id: 'variantA'
        },
        variantLanguages: [
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
  }
}

describe('Source', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    mockUseInfiniteHits.mockReturnValue({
      items: videoItems,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: {
        __isArtificial: false,
        nbHits: videoItems.length
      }
    } as unknown as InstantSearchApi)

    jest.clearAllMocks()
  })

  it('calls onChange when video selected', async () => {
    const onChange = jest.fn()
    const result = jest.fn().mockReturnValue(getVideoMock.result)

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <MuxVideoUploadProvider>
          <EditorProvider initialState={{ selectedAttributeId: 'video1.id' }}>
            <Source selectedBlock={null} onChange={onChange} />
          </EditorProvider>
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Select Video' })
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select Video' }))
    await waitFor(() => fireEvent.click(screen.getByText('title1')))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        {
          duration: 144,
          videoId: 'videoId',
          videoVariantLanguageId: '529',
          source: VideoBlockSource.internal,
          startAt: 0,
          endAt: 144
        },
        true
      )
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-library' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('shows YouTube video', async () => {
    const onChange = jest.fn()
    render(
      <MockedProvider>
        <MuxVideoUploadProvider>
          <Source
            selectedBlock={{
              id: 'video1.id',
              __typename: 'VideoBlock',
              parentBlockId: 'card1.id',
              description:
                'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
              duration: 348,
              endAt: 348,
              fullsize: true,
              image: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg',
              muted: false,
              autoplay: true,
              startAt: 0,
              title: 'What is the Bible?',
              videoId: 'ak06MSETeo4',
              videoVariantLanguageId: null,
              parentOrder: 0,
              action: null,
              source: VideoBlockSource.youTube,
              mediaVideo: null,
              objectFit: null,
              subtitleLanguage: null,
              showGeneratedSubtitles: null,
              posterBlockId: 'poster1.id',
              children: []
            }}
            onChange={onChange}
          />
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'What is the Bible? What is the Bible? YouTube'
        })
      ).toBeInTheDocument()
    )
    expect(
      screen.getByRole('img', {
        name: 'What is the Bible?'
      })
    ).toHaveAttribute('src', 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg')
  })

  it('shows video details on source button click', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <MuxVideoUploadProvider>
          <Source
            selectedBlock={{
              id: 'video1.id',
              __typename: 'VideoBlock',
              parentBlockId: 'card1.id',
              description:
                'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
              duration: 348,
              endAt: 348,
              fullsize: true,
              image: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg',
              muted: false,
              autoplay: true,
              startAt: 0,
              title: 'What is the Bible?',
              videoId: 'ak06MSETeo4',
              videoVariantLanguageId: null,
              parentOrder: 0,
              action: null,
              source: VideoBlockSource.youTube,
              mediaVideo: {
                __typename: 'YouTube',
                id: 'ak06MSETeo4'
              },
              objectFit: null,
              subtitleLanguage: null,
              showGeneratedSubtitles: null,
              posterBlockId: 'poster1.id',
              children: []
            }}
            onChange={onChange}
          />
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'What is the Bible? What is the Bible? YouTube'
        })
      ).toBeInTheDocument()
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'What is the Bible? What is the Bible? YouTube'
      })
    )
    await waitFor(() =>
      expect(screen.getByText('Video Details')).toBeInTheDocument()
    )
    expect(screen.getByText('What is the Bible?')).toBeInTheDocument()
  })

  it('shows SourceFromLocal when source is internal with videoId', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider mocks={[getVideoVariantLanguagesMock]}>
        <MuxVideoUploadProvider>
          <EditorProvider>
            <Source
              selectedBlock={{
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                description: 'A local video',
                duration: 120,
                endAt: 120,
                fullsize: true,
                image: 'https://example.com/image.jpg',
                muted: false,
                autoplay: true,
                startAt: 0,
                title: 'Local Video Title',
                videoId: 'videoId',
                videoVariantLanguageId: '529',
                parentOrder: 0,
                action: null,
                source: VideoBlockSource.internal,
                mediaVideo: {
                  __typename: 'Video',
                  id: 'videoId',
                  images: [
                    {
                      __typename: 'CloudflareImage',
                      mobileCinematicHigh: 'https://example.com/thumbnail.jpg'
                    }
                  ],
                  title: [
                    { __typename: 'VideoTitle', value: 'Local Video Title' }
                  ],
                  variant: null,
                  variantLanguages: []
                },
                objectFit: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: false,
                posterBlockId: null,
                children: []
              }}
              onChange={onChange}
            />
          </EditorProvider>
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('VideoSource')).toBeInTheDocument()
    )
  })

  it('shows SourceFromMux when source is mux', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <MuxVideoUploadProvider>
          <EditorProvider>
            <Source
              selectedBlock={{
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                description: 'A Mux video',
                duration: 180,
                endAt: 180,
                fullsize: true,
                image: 'https://example.com/mux-image.jpg',
                muted: false,
                autoplay: true,
                startAt: 0,
                title: 'Mux Video Title',
                videoId: 'muxVideoId',
                videoVariantLanguageId: null,
                parentOrder: 0,
                action: null,
                source: VideoBlockSource.mux,
                mediaVideo: null,
                objectFit: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: false,
                posterBlockId: null,
                children: []
              }}
              onChange={onChange}
            />
          </EditorProvider>
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('Mux Video Title')).toBeInTheDocument()
    )
    expect(screen.getByText('Custom Video')).toBeInTheDocument()
  })

  it('shows SourceEmpty when selectedBlock is null', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <EditorProvider>
          <Source selectedBlock={null} onChange={onChange} />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('Select Video')).toBeInTheDocument()
    )
  })

  it('shows SourceEmpty when source is internal without videoId', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <EditorProvider>
          <Source
            selectedBlock={{
              id: 'video1.id',
              __typename: 'VideoBlock',
              parentBlockId: 'card1.id',
              description: '',
              duration: 0,
              endAt: 0,
              fullsize: true,
              image: null,
              muted: false,
              autoplay: true,
              startAt: 0,
              title: null,
              videoId: null,
              videoVariantLanguageId: null,
              parentOrder: 0,
              action: null,
              source: VideoBlockSource.internal,
              mediaVideo: null,
              objectFit: null,
              subtitleLanguage: null,
              showGeneratedSubtitles: false,
              posterBlockId: null,
              children: []
            }}
            onChange={onChange}
          />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('Select Video')).toBeInTheDocument()
    )
  })

  it('opens VideoLibrary dialog when card is clicked', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <MuxVideoUploadProvider>
          <EditorProvider initialState={{ selectedAttributeId: 'video1.id' }}>
            <Source selectedBlock={null} onChange={onChange} />
          </EditorProvider>
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('card click area')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByTestId('card click area'))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-library' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('renders VideoLibrary component when open is true', async () => {
    const onChange = jest.fn()
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <MuxVideoUploadProvider>
          <EditorProvider initialState={{ selectedAttributeId: 'video1.id' }}>
            <Source selectedBlock={null} onChange={onChange} />
          </EditorProvider>
        </MuxVideoUploadProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('card click area')).toBeInTheDocument()
    )
    expect(screen.queryByText('Video Library')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('card click area'))
    await waitFor(() => {
      expect(screen.getByText('Video Library')).toBeInTheDocument()
    })
  })
})
