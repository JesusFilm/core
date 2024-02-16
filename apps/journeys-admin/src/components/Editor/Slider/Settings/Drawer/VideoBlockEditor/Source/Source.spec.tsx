import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import {
  VideoBlockSource,
  VideoLabel
} from '../../../../../../../../__generated__/globalTypes'
import { videos } from '../../VideoLibrary/VideoFromLocal/data'
import { GET_VIDEO } from '../../VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { GET_VIDEOS } from '../../VideoLibrary/VideoFromLocal/VideoFromLocal'

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

const getVideosMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: null,
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
      }
    }
  },
  result: {
    data: {
      videos
    }
  }
}

const getVideoMock = {
  request: {
    query: GET_VIDEO,
    variables: {
      id: '2_0-Brand_Video',
      languageId: '529'
    }
  },
  result: {
    data: {
      video: {
        id: '2_0-Brand_Video',
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

    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getVideosMock, { ...getVideoMock, result }]}>
        <Source selectedBlock={null} onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select Video' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Select Video' }))
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        duration: 144,
        videoId: '2_0-Brand_Video',
        videoVariantLanguageId: '529',
        source: VideoBlockSource.internal,
        startAt: 0,
        endAt: 144
      })
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'video-library' },
        push,
        events: {
          on
        }
      })
    })
  })

  it('shows YouTube video', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
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
        getByRole('button', {
          name: 'What is the Bible? What is the Bible? YouTube'
        })
      ).toBeInTheDocument()
    )
    expect(
      getByRole('img', {
        name: 'What is the Bible?'
      })
    ).toHaveAttribute('src', 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg')
  })

  it('shows Cloudflare video', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
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
        getByRole('button', {
          name: 'What is the Bible? What is the Bible? Custom Video'
        })
      ).toBeInTheDocument()
    )
    expect(
      getByRole('img', {
        name: 'What is the Bible?'
      }).getAttribute('src')
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

    const { getByRole, getByText } = render(
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
        getByRole('button', {
          name: 'What is the Bible? What is the Bible? YouTube'
        })
      ).toBeInTheDocument()
    )
    fireEvent.click(
      getByRole('button', {
        name: 'What is the Bible? What is the Bible? YouTube'
      })
    )
    await waitFor(() => expect(getByText('Video Details')).toBeInTheDocument())
    expect(getByText('What is the Bible?')).toBeInTheDocument()
  })
})
