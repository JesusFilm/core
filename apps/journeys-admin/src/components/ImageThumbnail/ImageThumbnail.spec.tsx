import { render } from '@testing-library/react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../__generated__/GetJourney'

import { ImageThumbnail } from './ImageThumbnail'

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

describe('ImageThumbnail', () => {
  describe('No existing Image', () => {
    it('shows placeholders on null', async () => {
      const { getByTestId } = render(<ImageThumbnail imageSrc={null} />)
      expect(getByTestId('imageThumbnailPlaceholder')).toBeInTheDocument()
    })
  })

  describe('Existing Image', () => {
    it('shows image', async () => {
      const { getByRole } = render(
        <ImageThumbnail imageSrc={image.src} imageAlt={image.alt} />
      )
      const img = await getByRole('img')
      expect(img).toHaveAttribute('src', image.src)
      expect(img).toHaveAttribute('alt', image.alt)
    })
  })

  it('should show the loading circle', () => {
    const { getByRole } = render(
      <ImageThumbnail imageSrc={image.src} imageAlt={image.alt} loading />
    )
    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render error state', () => {
    const { getByTestId } = render(
      <ImageThumbnail imageSrc={image.src} imageAlt={image.alt} error />
    )
    expect(getByTestId('BrokenImageOutlinedIcon')).toBeInTheDocument()
  })
})
