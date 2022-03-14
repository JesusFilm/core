import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { Image } from './Image'

describe('Image', () => {
  it('should display Image Options', () => {
    const image: TreeBlock<ImageBlock> = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      src: 'https://example.com/image.jpg',
      alt: 'image.jpg',
      width: 1920,
      height: 1080,
      blurhash: '',
      children: []
    }

    const { getByText } = render(<Image {...image} />) // eslint-disable-line

    expect(getByText('Image Source')).toBeInTheDocument()
    expect(getByText(image.alt)).toBeInTheDocument()
  })
})
