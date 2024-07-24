import { render } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

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

    it('shows unsplash image', async () => {
      const { getByRole } = render(
        <ImageBlockThumbnail
          selectedBlock={{
            ...image,
            src: 'https://images.unsplash.com/photo-1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=1&ixlib=rb-4.0.3&q=80&w=1080'
          }}
        />
      )
      const img = await getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        'https://images.unsplash.com/photo-1?cs=tinysrgb&fit=crop&fm=jpg&ixid=1&ixlib=rb-4.0.3&q=80&w=55&h=55&auto=format'
      )
      expect(img).toHaveAttribute(
        'srcset',
        'https://images.unsplash.com/photo-1?cs=tinysrgb&fit=crop&fm=jpg&ixid=1&ixlib=rb-4.0.3&q=80&w=55&h=55&auto=format&dpr=2 2x'
      )
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
    expect(getByTestId('ImageXIcon')).toBeInTheDocument()
  })
})
