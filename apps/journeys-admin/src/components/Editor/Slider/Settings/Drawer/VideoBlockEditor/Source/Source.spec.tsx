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
import { GET_VIDEO } from '../../VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'

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
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
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

describe('Source', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    mockUseInfiniteHits.mockReturnValue({
      hits: [
        {
          videoId: 'videoId',
          titles: ['title1'],
          description: ['description'],
          duration: 10994,
          languageId: '529',
          subtitles: [],
          slug: 'video-slug/english',
          label: 'featureFilm',
          image:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
          imageAlt: 'Life of Jesus (Gospel of John)',
          childrenCount: 49,
          objectID: '2_529-GOJ-0-0'
        }
      ],
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)
    mockUseInstantSearch.mockReturnValue({
      status: 'idle'
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
        <EditorProvider initialState={{ selectedAttributeId: 'video1.id' }}>
          <Source selectedBlock={null} onChange={onChange} />
        </EditorProvider>
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
      expect(onChange).toHaveBeenCalledWith({
        duration: 144,
        videoId: 'videoId',
        videoVariantLanguageId: '529',
        source: VideoBlockSource.internal,
        startAt: 0,
        endAt: 144
      })
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
            video: null,
            objectFit: null,
            posterBlockId: 'poster1.id',
            children: []
          }}
          onChange={onChange}
        />
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

  it('shows Cloudflare video', async () => {
    const onChange = jest.fn()
    render(
      <MockedProvider>
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
            image: null,
            muted: false,
            autoplay: true,
            startAt: 0,
            title: 'What is the Bible?',
            videoId: 'videoId',
            videoVariantLanguageId: null,
            parentOrder: 0,
            action: null,
            source: VideoBlockSource.cloudflare,
            video: null,
            objectFit: null,
            posterBlockId: 'poster1.id',
            children: []
          }}
          onChange={onChange}
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'What is the Bible? What is the Bible? Custom Video'
        })
      ).toBeInTheDocument()
    )
    expect(
      screen
        .getByRole('img', {
          name: 'What is the Bible?'
        })
        .getAttribute('src')
    ).toMatch(
      /https:\/\/customer-.*\.cloudflarestream\.com\/videoId\/thumbnails\/thumbnail.jpg\?time=2s&height=55&width=55/
    )
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
            video: null,
            objectFit: null,
            posterBlockId: 'poster1.id',
            children: []
          }}
          onChange={onChange}
        />
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
})
