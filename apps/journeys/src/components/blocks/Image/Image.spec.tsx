import { render } from '../../../../test/testingLibrary'
import { Image } from '.'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

describe('Image', () => {
  const block: TreeBlock<ImageBlock> = {
    __typename: 'ImageBlock',
    id: 'Image1',
    src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    width: 500,
    height: 500,
    alt: 'ducks',
    parentBlockId: 'Image1',
    children: []
  }

  it('should have alt props', () => {
    const { getByAltText } = render(<Image {...block} alt={block.alt} />)
    expect(getByAltText('ducks')).toBeInTheDocument()
  })
})
