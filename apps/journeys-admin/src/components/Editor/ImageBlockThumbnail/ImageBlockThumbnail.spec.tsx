import { render } from '@testing-library/react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'

import { ImageBlockThumbnail } from './ImageBlockThumbnail'

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

describe('ImageBlockThumbnail', () => {
  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      const { getByTestId } = render(
        <ImageBlockThumbnail selectedBlock={null} />
      )
      expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    })
  })

  describe('Existing ImageBlock', () => {
    it('shows image', async () => {
      const { getByRole } = render(
        <ImageBlockThumbnail selectedBlock={image} />
      )
      const img = await getByRole('img')
      expect(img).toHaveAttribute('src', image.src)
      expect(img).toHaveAttribute('alt', image.alt)
    })
  })

  it('should show the loading circle', () => {
    const { getByRole } = render(
      <ImageBlockThumbnail selectedBlock={image} loading />
    )
    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render error state', () => {
    const { getByTestId } = render(
      <ImageBlockThumbnail selectedBlock={image} error />
    )
    expect(getByTestId('BrokenImageOutlinedIcon')).toBeInTheDocument()
  })
})
