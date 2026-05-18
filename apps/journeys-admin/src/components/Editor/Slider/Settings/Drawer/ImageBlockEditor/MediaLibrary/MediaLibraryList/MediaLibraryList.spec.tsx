import { fireEvent, render, screen } from '@testing-library/react'

import { MediaLibraryList, MediaLibraryListImage } from './MediaLibraryList'

const images: MediaLibraryListImage[] = [
  { id: 'a', src: 'https://example.com/a/public', blurhash: 'hashA' },
  { id: 'b', src: 'https://example.com/b/public', blurhash: null },
  { id: 'c', src: 'https://example.com/c/public', blurhash: 'hashC' }
]

describe('MediaLibraryList', () => {
  it('should render a tile for each image', () => {
    render(<MediaLibraryList images={images} handleSelect={jest.fn()} />)
    expect(screen.getByTestId('media-library-image-a')).toBeInTheDocument()
    expect(screen.getByTestId('media-library-image-b')).toBeInTheDocument()
    expect(screen.getByTestId('media-library-image-c')).toBeInTheDocument()
  })

  it('should not render the uploading placeholder when uploading is undefined', () => {
    render(<MediaLibraryList images={images} handleSelect={jest.fn()} />)
    expect(
      screen.queryByTestId('media-library-image-uploading')
    ).not.toBeInTheDocument()
  })

  it('should not render the uploading placeholder when uploading is false', () => {
    render(
      <MediaLibraryList
        images={images}
        handleSelect={jest.fn()}
        uploading={false}
      />
    )
    expect(
      screen.queryByTestId('media-library-image-uploading')
    ).not.toBeInTheDocument()
  })

  it('should render the uploading placeholder when uploading is true', () => {
    render(
      <MediaLibraryList images={images} handleSelect={jest.fn()} uploading />
    )
    expect(
      screen.getByTestId('media-library-image-uploading')
    ).toBeInTheDocument()
  })

  it('should call handleSelect with the clicked image', () => {
    const handleSelect = jest.fn()
    render(<MediaLibraryList images={images} handleSelect={handleSelect} />)
    fireEvent.click(screen.getByTestId('media-library-image-b'))
    expect(handleSelect).toHaveBeenCalledWith(images[1])
  })

  it('should expose an accessible name and pressed state on each tile', () => {
    render(
      <MediaLibraryList
        images={images}
        selectedSrc="https://example.com/b/public"
        handleSelect={jest.fn()}
      />
    )
    const tileA = screen.getByTestId('media-library-image-a')
    const tileB = screen.getByTestId('media-library-image-b')
    expect(tileA.getAttribute('aria-label')).toBe('Select image')
    expect(tileA.getAttribute('aria-pressed')).toBe('false')
    expect(tileB.getAttribute('aria-pressed')).toBe('true')
  })

  it('should set lazy loading and empty alt on image tags', () => {
    render(<MediaLibraryList images={images} handleSelect={jest.fn()} />)
    const img = screen
      .getByTestId('media-library-image-a')
      .querySelector('img') as HTMLImageElement
    expect(img).not.toBeNull()
    expect(img.getAttribute('alt')).toBe('')
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(img.getAttribute('src')).toBe('https://example.com/a/public')
  })

  it('should render no tiles when images is empty and not uploading', () => {
    const { container } = render(
      <MediaLibraryList images={[]} handleSelect={jest.fn()} />
    )
    expect(
      screen.queryByTestId(/^media-library-image-/)
    ).not.toBeInTheDocument()
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('should still render the uploading placeholder when images is empty and uploading', () => {
    render(<MediaLibraryList images={[]} handleSelect={jest.fn()} uploading />)
    expect(
      screen.getByTestId('media-library-image-uploading')
    ).toBeInTheDocument()
  })
})
