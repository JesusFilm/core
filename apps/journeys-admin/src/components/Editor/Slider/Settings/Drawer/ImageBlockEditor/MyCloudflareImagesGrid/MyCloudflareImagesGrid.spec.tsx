import { InMemoryCache } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  GET_MY_CLOUDFLARE_IMAGES,
  MyCloudflareImagesGrid
} from './MyCloudflareImagesGrid'

function makeImages(count: number, offset = 0): Array<{
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

const firstPageMock: MockedResponse = {
  request: {
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 0, limit: 9, isAi: false }
  },
  result: {
    data: { getMyCloudflareImages: makeImages(9) }
  }
}

const secondPageMock: MockedResponse = {
  request: {
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 9, limit: 9, isAi: false }
  },
  result: {
    data: { getMyCloudflareImages: makeImages(3, 9) }
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

describe('MyCloudflareImagesGrid', () => {
  it('should render images returned by the query', async () => {
    render(
      <MockedProvider mocks={[firstPageMock]}>
        <MyCloudflareImagesGrid
          title="Your uploads"
          onSelect={jest.fn()}
          isAi={false}
        />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('my-cloudflare-image-img-0')).toBeInTheDocument()
    })
    expect(screen.getByText('Your uploads')).toBeInTheDocument()
  })

  it('should invoke onSelect with imagedelivery src when a tile is clicked', async () => {
    const onSelect = jest.fn()
    render(
      <MockedProvider mocks={[firstPageMock]}>
        <MyCloudflareImagesGrid
          title="Your uploads"
          onSelect={onSelect}
          isAi={false}
        />
      </MockedProvider>
    )
    const tile = await screen.findByTestId('my-cloudflare-image-img-0')
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

  it('should render the processing tile when uploading is true', () => {
    render(
      <MockedProvider mocks={[firstPageMock]}>
        <MyCloudflareImagesGrid
          title="Your uploads"
          onSelect={jest.fn()}
          isAi={false}
          uploading
        />
      </MockedProvider>
    )
    expect(
      screen.getByTestId('my-cloudflare-image-uploading')
    ).toBeInTheDocument()
  })

  it('should page nine at a time without skips or duplicates when Load More is clicked', async () => {
    render(
      <MockedProvider
        mocks={[firstPageMock, secondPageMock]}
        cache={paginatedCache()}
      >
        <MyCloudflareImagesGrid
          title="Your uploads"
          onSelect={jest.fn()}
          isAi={false}
        />
      </MockedProvider>
    )
    await screen.findByTestId('my-cloudflare-image-img-0')
    await waitFor(() => {
      expect(screen.getByTestId('my-cloudflare-image-img-8')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))

    await waitFor(() => {
      expect(screen.getByTestId('my-cloudflare-image-img-9')).toBeInTheDocument()
    })
    expect(screen.getByTestId('my-cloudflare-image-img-11')).toBeInTheDocument()
    // No duplicates: img-0 still rendered exactly once
    expect(screen.getAllByTestId('my-cloudflare-image-img-0')).toHaveLength(1)
    // No skips: img-8 (last of first page) and img-9 (first of second page) both present
    expect(screen.getByTestId('my-cloudflare-image-img-8')).toBeInTheDocument()
  })

  it('should disable Load More with "No more to load" once a short page returns', async () => {
    render(
      <MockedProvider
        mocks={[firstPageMock, secondPageMock]}
        cache={paginatedCache()}
      >
        <MyCloudflareImagesGrid
          title="Your uploads"
          onSelect={jest.fn()}
          isAi={false}
        />
      </MockedProvider>
    )
    await screen.findByTestId('my-cloudflare-image-img-0')
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'No more to load' })
      ).toBeDisabled()
    })
  })
})
