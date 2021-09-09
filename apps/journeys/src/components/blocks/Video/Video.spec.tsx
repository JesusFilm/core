import { render } from '@testing-library/react'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video } from '.'

describe('BlockRendererVideo', () => {
  const block: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'main',
    src: 'https://www.youtube.com',
    title: 'title',
    parentBlockId: null,
    provider: null,
    children: []
  }
  it('should render successfully', () => {
    const { getByText } = render(<Video {...block} />)

    expect(getByText('Render title Here')).toBeInTheDocument()
  })
})
