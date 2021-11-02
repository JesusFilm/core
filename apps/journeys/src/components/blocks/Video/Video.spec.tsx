import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video, VIDEO_RESPONSE_CREATE } from '.'
import { MockedProvider } from '@apollo/client/testing'
import { VideoResponseStateEnum } from '../../../../__generated__/globalTypes'

describe('VideoComponent', () => {
  const block: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'Video1',
    parentBlockId: '',
    autoplay: false,
    title: 'Video',
    startAt: 10,
    endAt: null,
    muted: null,
    videoContent: {
      __typename: 'VideoArclight',
      src: 'https://manifest.prod.boltdns.net/manifest/v1/hls/v4/clear/1226740748001/23f84185-80ff-49bd-8dbb-75c53022daef/10s/master.m3u8?fastly_token=NjE4MGJkMzlfMDQ1OGE5MTNjNzAxODg4NGRiZjFlZGEyOTQwMzkxYjk0NjM4NDIzMjIxNDc0M2I5OGNjNzBlYWY3MzM2OTBlNw%3D%3D'
    },
    children: []
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
                position: 0.3
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING,
                position: 0.3
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
                position: 0.3
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING,
                position: 0.3
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

    expect(getByTestId('VideoComponent')).toBeInTheDocument()
  })
})
