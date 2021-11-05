import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video, VIDEO_RESPONSE_CREATE } from '.'
import { MockedProvider } from '@apollo/client/testing'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'

describe('VideoComponent', () => {
  const block: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'videoBlockId',
    parentBlockId: '',
    autoplay: false,
    title: 'Video',
    startAt: 10,
    endAt: null,
    muted: null,
    posterBlockId: 'posterBlockId',
    videoContent: {
      __typename: 'VideoArclight',
      src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/23f84185-80ff-49bd-8dbb-75c53022daef/10s/master.m3u8?fastly_token=NjE4MGJkMzlfMDQ1OGE5MTNjNzAxODg4NGRiZjFlZGEyOTQwMzkxYjk0NjM4NDIzMjIxNDc0M2I5OGNjNzBlYWY3MzM2OTBlNw%3D%3D'
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
        parentBlockId: 'videoBlockId',
        children: []
      }
    ]
  }

  it('should render the video through mediaComponentId and languageId successfully', () => {
    const { getByTestId } = renderWithApolloClient(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'Video1',
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

    expect(getByTestId('VideoComponent')).toBeInTheDocument()
  })

  it('should render the video through a generic source successfully', () => {
    const { getByTestId } = renderWithApolloClient(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'Video1',
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
    expect(getByTestId('VideoComponent').getAttribute('poster')).toEqual(
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
    )
  })
})
