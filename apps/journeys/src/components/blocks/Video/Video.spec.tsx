import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video } from '.'

describe('VideoComponent', () => {
  const block: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'Video1',
    parentBlockId: '',
    volume: 1,
    autoplay: false,
    src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
    title: 'Video',
    children: []
  }

  it('should render the video successfully', () => {
    const { getByTestId } = renderWithApolloClient(<Video {...block} />)
    expect(getByTestId('VideoComponent')).toBeInTheDocument()
  })
})
