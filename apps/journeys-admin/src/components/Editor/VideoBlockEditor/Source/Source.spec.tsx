import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { GET_VIDEOS } from '../../VideoLibrary/VideoFromLocal/VideoFromLocal'
import { GET_VIDEO } from '../../VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { videos } from '../../VideoLibrary/VideoFromLocal/data'
import { Source } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const getVideosMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: null
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
  it('calls onChange when video selected', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[getVideosMock, getVideoMock]}>
        <Source selectedBlock={null} onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('Brand Video')).toBeInTheDocument())
    fireEvent.click(getByText('Brand Video'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        videoId: '2_0-Brand_Video',
        videoVariantLanguageId: '529',
        source: VideoBlockSource.internal,
        startAt: 0,
        endAt: 144
      })
    )
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
            posterBlockId: 'poster1.id',
            children: []
          }}
          onChange={onChange}
        />
      </MockedProvider>
    )
    expect(
      getByRole('button', {
        name: 'What is the Bible? What is the Bible? YouTube'
      })
    ).toBeInTheDocument()
  })

  it('shows video details on source button click', () => {
    const onChange = jest.fn()
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
            posterBlockId: 'poster1.id',
            children: []
          }}
          onChange={onChange}
        />
      </MockedProvider>
    )
    fireEvent.click(
      getByRole('button', {
        name: 'What is the Bible? What is the Bible? YouTube'
      })
    )
    expect(getByText('Video Details')).toBeInTheDocument()
    expect(getByText('What is the Bible?')).toBeInTheDocument()
  })
})
