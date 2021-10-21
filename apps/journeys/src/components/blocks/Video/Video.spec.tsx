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
    volume: 1,
    autoplay: false,
    mediaComponentId: '2_0-FallingPlates',
    languageId: '529',
    videoSrc: null,
    title: 'Video',
    children: []
  }

  it('should render the video successfully', () => {
    const { getByTestId } = renderWithApolloClient(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'Video1',
                state: VideoResponseStateEnum.PLAYING
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING
              }
            }
          }
        ]}
      >
        <Video
          {...block}
          mediaComponentId="2_0-FallingPlates"
          languageId="529"
        />
      </MockedProvider>
    )

    expect(getByTestId('VideoComponent')).toHaveClass('video-js')
  })

  it('should render the video successfully', () => {
    const { getByTestId } = renderWithApolloClient(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_RESPONSE_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'Video1',
                state: VideoResponseStateEnum.PLAYING
              }
            },
            result: {
              data: {
                id: 'uuid',
                state: VideoResponseStateEnum.PLAYING
              }
            }
          }
        ]}
      >
        <Video
          {...block}
          videoSrc="https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8"
        />
      </MockedProvider>
    )

    expect(getByTestId('VideoComponent')).toHaveClass('video-js')
  })
})
