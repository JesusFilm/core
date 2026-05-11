import { InMemoryCache } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GET_MY_CLOUDFLARE_IMAGES, MediaLibrary } from './MediaLibrary'

function makeImages(
  count: number,
  offset = 0
): Array<{
  __typename: 'CloudflareImage'
  id: string
  url: string
  blurhash: string | null
}> {
  return Array.from({ length: count }, (_, i) => ({
    __typename: 'CloudflareImage' as const,
    id: `img-${offset + i}`,
    url: `https://imagedelivery.net/key/img-${offset + i}`,
    blurhash: null
  }))
}

const firstFullPageMock: MockedResponse = {
  request: {
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 0, limit: 11, isAi: false }
  },
  result: {
    data: { getMyCloudflareImages: makeImages(11) }
  }
}

const firstShortPageMock: MockedResponse = {
  request: {
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 0, limit: 11, isAi: false }
  },
  result: {
    data: { getMyCloudflareImages: makeImages(5) }
  }
}

const secondShortPageMock: MockedResponse = {
  request: {
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 10, limit: 11, isAi: false }
  },
  result: {
    data: { getMyCloudflareImages: makeImages(3, 11) }
  }
}

function paginatedCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getMyCloudflareImages: offsetLimitPagination(['isAi'])
        }
      }
    }
  })
}

describe('MediaLibrary', () => {
  it('should render images returned by the query', async () => {
    render(
      <MockedProvider mocks={[firstFullPageMock]}>
        <MediaLibrary title="Your uploads" onSelect={jest.fn()} isAi={false} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByTestId('media-library-image-img-0')
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Your uploads')).toBeInTheDocument()
  })

  it('should render only PAGE_SIZE tiles when the server returns a full peek', async () => {
    render(
      <MockedProvider mocks={[firstFullPageMock]}>
        <MediaLibrary title="Your uploads" onSelect={jest.fn()} isAi={false} />
      </MockedProvider>
    )
    await screen.findByTestId('media-library-image-img-0')
    expect(screen.getByTestId('media-library-image-img-9')).toBeInTheDocument()
    expect(
      screen.queryByTestId('media-library-image-img-10')
    ).not.toBeInTheDocument()
  })

  it('should render nothing when the query returns no images', async () => {
    const emptyMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 11, isAi: false }
      },
      result: { data: { getMyCloudflareImages: [] } }
    }
    const { container } = render(
      <MockedProvider mocks={[emptyMock]}>
        <MediaLibrary title="Your uploads" onSelect={jest.fn()} isAi={false} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it('should render an error message when the query errors', async () => {
    const errorMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 11, isAi: false }
      },
      error: new Error('boom')
    }
    render(
      <MockedProvider mocks={[errorMock]}>
        <MediaLibrary title="Your uploads" onSelect={jest.fn()} isAi={false} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        screen.getByText('Could not load your images.')
      ).toBeInTheDocument()
    })
  })

  it('should invoke onSelect with imagedelivery src when a tile is clicked', async () => {
    const onSelect = jest.fn()
    render(
      <MockedProvider mocks={[firstFullPageMock]}>
        <MediaLibrary title="Your uploads" onSelect={onSelect} isAi={false} />
      </MockedProvider>
    )
    const tile = await screen.findByTestId('media-library-image-img-0')
    fireEvent.click(tile)
    expect(onSelect).toHaveBeenCalledWith({
      src: 'https://imagedelivery.net/key/img-0/public',
      blurhash: null,
      scale: 100,
      focalLeft: 50,
      focalTop: 50,
      customizable: null
    })
  })

  it('should render the uploading tile when uploading is true', () => {
    render(
      <MockedProvider mocks={[firstFullPageMock]}>
        <MediaLibrary
          title="Your uploads"
          onSelect={jest.fn()}
          isAi={false}
          uploading
        />
      </MockedProvider>
    )
    expect(
      screen.getByTestId('media-library-image-uploading')
    ).toBeInTheDocument()
  })

  it('should page without skips or duplicates when Load More is clicked', async () => {
    render(
      <MockedProvider
        mocks={[firstFullPageMock, secondShortPageMock]}
        cache={paginatedCache()}
      >
        <MediaLibrary title="Your uploads" onSelect={jest.fn()} isAi={false} />
      </MockedProvider>
    )
    await screen.findByTestId('media-library-image-img-0')
    await waitFor(() => {
      expect(
        screen.getByTestId('media-library-image-img-9')
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))

    await waitFor(() => {
      expect(
        screen.getByTestId('media-library-image-img-11')
      ).toBeInTheDocument()
    })
    expect(screen.getByTestId('media-library-image-img-12')).toBeInTheDocument()
    expect(screen.getByTestId('media-library-image-img-13')).toBeInTheDocument()
    expect(screen.getAllByTestId('media-library-image-img-0')).toHaveLength(1)
    expect(screen.getByTestId('media-library-image-img-9')).toBeInTheDocument()
  })

  it('should disable Load More with "No more to load" when a short page is returned', async () => {
    render(
      <MockedProvider mocks={[firstShortPageMock]}>
        <MediaLibrary title="Your uploads" onSelect={jest.fn()} isAi={false} />
      </MockedProvider>
    )
    await screen.findByTestId('media-library-image-img-0')
    expect(
      screen.getByRole('button', { name: 'No more to load' })
    ).toBeDisabled()
  })

  it('should forward isAi=true to the query variables', async () => {
    const aiMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 11, isAi: true }
      },
      result: { data: { getMyCloudflareImages: makeImages(2) } }
    }
    render(
      <MockedProvider mocks={[aiMock]}>
        <MediaLibrary title="Your generations" onSelect={jest.fn()} isAi />
      </MockedProvider>
    )
    expect(
      await screen.findByTestId('media-library-image-img-0')
    ).toBeInTheDocument()
  })
})
