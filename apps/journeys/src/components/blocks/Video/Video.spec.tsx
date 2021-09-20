import { render } from '@testing-library/react'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video } from '.'
import { VideoProviderEnum } from '../../../../__generated__/globalTypes'

describe('BlockRendererVideo', () => {
  const block: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'main',
    src: 'https://www.youtube.com',
    title: 'title',
    parentBlockId: null,
    provider: VideoProviderEnum.YOUTUBE,
    children: []
  }
  it('should render successfully', () => {
    const { getByText } = render(<Video {...block} />)

    expect(getByText('Render title Here')).toBeInTheDocument()
  })
})
