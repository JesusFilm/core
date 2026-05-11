import { fireEvent, render, screen } from '@testing-library/react'

import { MediaLibraryList, MediaLibraryListImage } from './MediaLibraryList'

const images: MediaLibraryListImage[] = [
  { id: 'a', src: 'https://example.com/a/public', blurhash: 'hashA' },
  { id: 'b', src: 'https://example.com/b/public', blurhash: null },
  { id: 'c', src: 'https://example.com/c/public', blurhash: 'hashC' }
]

const instances: Array<{
  callback: IntersectionObserverCallback
  disconnect: jest.Mock
}> = []

beforeEach(() => {
  instances.length = 0
  ;(globalThis as any).IntersectionObserver = class {
    callback: IntersectionObserverCallback
    disconnect = jest.fn()
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb
      instances.push(this)
    }
    observe(): void {}
    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
})

function fireIntersect(isIntersecting = true, index = 0): void {
  instances[index].callback(
    [{ isIntersecting } as IntersectionObserverEntry],
    instances[index] as unknown as IntersectionObserver
  )
}

describe('MediaLibraryList', () => {
  describe('desktop tree', () => {
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
      render(
        <MediaLibraryList images={[]} handleSelect={jest.fn()} uploading />
      )
      expect(
        screen.getByTestId('media-library-image-uploading')
      ).toBeInTheDocument()
    })
  })

  describe('mobile tree', () => {
    it('should render the mobile container', () => {
      render(<MediaLibraryList images={images} handleSelect={jest.fn()} />)
      expect(screen.getByTestId('MediaLibraryListMobile')).toBeInTheDocument()
    })

    it('should render a mobile tile for each image with -mobile suffix', () => {
      render(<MediaLibraryList images={images} handleSelect={jest.fn()} />)
      expect(
        screen.getByTestId('media-library-image-a-mobile')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('media-library-image-b-mobile')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('media-library-image-c-mobile')
      ).toBeInTheDocument()
    })

    it('should render the mobile uploading placeholder when uploading is true', () => {
      render(
        <MediaLibraryList images={images} handleSelect={jest.fn()} uploading />
      )
      expect(
        screen.getByTestId('media-library-image-uploading-mobile')
      ).toBeInTheDocument()
    })

    it('should call handleSelect when a mobile tile is clicked', () => {
      const handleSelect = jest.fn()
      render(<MediaLibraryList images={images} handleSelect={handleSelect} />)
      fireEvent.click(screen.getByTestId('media-library-image-b-mobile'))
      expect(handleSelect).toHaveBeenCalledWith(images[1])
    })
  })

  describe('load-more sentinel', () => {
    it('should not render the sentinel when hasMore is false', () => {
      render(<MediaLibraryList images={images} handleSelect={jest.fn()} />)
      expect(
        screen.queryByTestId('media-library-load-more-sentinel')
      ).not.toBeInTheDocument()
    })

    it('should render the sentinel when hasMore is true', () => {
      render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          hasMore
          onLoadMore={jest.fn()}
        />
      )
      expect(
        screen.getByTestId('media-library-load-more-sentinel')
      ).toBeInTheDocument()
    })

    it('should render a CircularProgress in the sentinel when loadingMore is true', () => {
      render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          hasMore
          loadingMore
          onLoadMore={jest.fn()}
        />
      )
      expect(
        screen
          .getByTestId('media-library-load-more-sentinel')
          .querySelector('svg')
      ).not.toBeNull()
    })

    it('should not call onLoadMore before the sentinel intersects', () => {
      const onLoadMore = jest.fn()
      render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          hasMore
          onLoadMore={onLoadMore}
        />
      )
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('should call onLoadMore when the sentinel intersects', () => {
      const onLoadMore = jest.fn()
      render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          hasMore
          onLoadMore={onLoadMore}
        />
      )
      fireIntersect(true)
      expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    it('should not call onLoadMore when the sentinel reports not intersecting', () => {
      const onLoadMore = jest.fn()
      render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          hasMore
          onLoadMore={onLoadMore}
        />
      )
      fireIntersect(false)
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('should disconnect the observer on unmount', () => {
      const { unmount } = render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          hasMore
          onLoadMore={jest.fn()}
        />
      )
      expect(instances[0].disconnect).not.toHaveBeenCalled()
      unmount()
      expect(instances[0].disconnect).toHaveBeenCalled()
    })

    it('should not create an observer when hasMore is false', () => {
      render(
        <MediaLibraryList
          images={images}
          handleSelect={jest.fn()}
          onLoadMore={jest.fn()}
        />
      )
      expect(instances).toHaveLength(0)
    })

    it('should not crash when IntersectionObserver is undefined', () => {
      delete (globalThis as any).IntersectionObserver
      const onLoadMore = jest.fn()
      expect(() =>
        render(
          <MediaLibraryList
            images={images}
            handleSelect={jest.fn()}
            hasMore
            onLoadMore={onLoadMore}
          />
        )
      ).not.toThrow()
      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })
})
