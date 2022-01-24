import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock, EditorProvider } from '../..'
import { VideoResponseStateEnum } from '../../../__generated__/globalTypes'
import { VideoFields } from './__generated__/VideoFields'
import { Video, VIDEO_RESPONSE_CREATE } from '.'

const block: TreeBlock<VideoFields> = {
  __typename: 'VideoBlock',
  id: 'video0.id',
  parentBlockId: '',
  autoplay: false,
  title: 'Video',
  startAt: 10,
  endAt: null,
  muted: null,
  posterBlockId: 'posterBlockId',
  videoContent: {
    __typename: 'VideoArclight',
    src: 'https://arc.gt/hls/2_0-FallingPlates/529'
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
      children: []
    }
  ]
}

describe('Video', () => {
  it('should render the video through mediaComponentId and languageId successfully', () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'video0.id',
                state: VideoResponseStateEnum.PLAYING,
                position: 30
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING,
                position: 30
              }
            }
          }
        ]}
      >
        <Video {...block} />
      </MockedProvider>
    )
    const sourceTag =
      getByTestId('video-video0.id').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://arc.gt/hls/2_0-FallingPlates/529'
    )
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
  })

  it('should render the video through a generic source successfully', () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'video0.id',
                state: VideoResponseStateEnum.PLAYING,
                position: 30
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING,
                position: 30
              }
            }
          }
        ]}
      >
        <Video
          {...block}
          videoContent={{
            __typename: 'VideoGeneric',
            src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
          }}
        />
      </MockedProvider>
    )
    const sourceTag =
      getByTestId('video-video0.id').querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
    )
    expect(sourceTag?.getAttribute('type')).toEqual(null)
  })

  it('should render the video through a generic source successfully', () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'video0.id',
                state: VideoResponseStateEnum.PLAYING,
                position: 30
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING,
                position: 30
              }
            }
          }
        ]}
      >
        <Video
          {...block}
          videoContent={{
            __typename: 'VideoGeneric',
            src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('video-video0.id')
        .querySelector('.vjs-poster')
        ?.getAttribute('style')
    ).toEqual(
      'background-image: url(https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920);'
    )
  })

  it('should render an image if src is null', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Video
          {...block}
          videoContent={{
            __typename: 'VideoGeneric',
            src: null
          }}
        />
      </MockedProvider>
    )
    expect(getByRole('img')).toHaveAttribute('alt', 'DefaultVideoIcon')
  })
})

describe('Admin Video', () => {
  it('should select video on click', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider mocks={[]}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'card0.id',
              __typename: 'CardBlock',
              parentBlockId: 'step0.id',
              coverBlockId: null,
              backgroundColor: null,
              themeMode: null,
              themeName: null,
              fullscreen: false,
              children: [block]
            }
          }}
        >
          <Video {...block} />
        </EditorProvider>
      </MockedProvider>
    )
    const video = getByRole('region', { name: 'Video Player' })

    fireEvent.click(getByTestId('video-video0.id'))
    expect(getByTestId('video-video0.id')).toHaveStyle(
      'outline: 3px solid #C52D3A'
    )
    expect(video).toHaveClass('vjs-paused')
  })
})
