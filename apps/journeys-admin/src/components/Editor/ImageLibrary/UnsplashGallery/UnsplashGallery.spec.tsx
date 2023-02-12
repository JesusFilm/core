import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import {
  LIST_UNSPLASH_COLLECTION_PHOTOS,
  SEARCH_UNSPLASH_PHOTOS
} from './UnsplashGallery'
import { UnsplashGallery } from '.'

describe('UnsplashGallery', () => {
  const unsplashImage = {
    id: 1,
    width: 6240,
    height: 4160,
    alt_description: 'white dome building during daytime',
    urls: {
      small:
        'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDIyMzR8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNjc0Nzc0Mjk4&ixlib=rb-4.0.3&q=80&w=400'
    },
    user: {
      first_name: 'Levi Meir',
      last_name: 'Clancy',
      username: 'levimeirclancy'
    },
    color: '#262626'
  }

  it('should return a collection of images from unsplash', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: LIST_UNSPLASH_COLLECTION_PHOTOS,
              variables: {
                collectionId: '4924556',
                page: 1,
                perPage: 20
              }
            },
            result: {
              data: {
                listUnsplashCollectionPhotos: [unsplashImage]
              }
            }
          }
        ]}
      >
        <UnsplashGallery onChange={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('list')).toBeInTheDocument())
    expect(getByText('Levi Meir')).toBeInTheDocument()
  })

  it('should search images from unsplash', async () => {
    const { getByRole, getAllByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: LIST_UNSPLASH_COLLECTION_PHOTOS,
              variables: {
                collectionId: '4924556',
                page: 1,
                perPage: 20
              }
            },
            result: {
              data: {
                listUnsplashCollectionPhotos: [unsplashImage]
              }
            }
          },
          {
            request: {
              query: SEARCH_UNSPLASH_PHOTOS,
              variables: {
                query: 'Jesus',
                page: 1,
                perPage: 20
              }
            },
            result: {
              data: {
                searchUnsplashPhotos: {
                  results: [unsplashImage, unsplashImage]
                }
              }
            }
          }
        ]}
      >
        <UnsplashGallery onChange={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('list')).toBeInTheDocument())
    const textbox = getByRole('textbox', { name: 'UnsplashSearch' })
    fireEvent.change(textbox, { target: { value: 'Jesus' } })
    fireEvent.submit(textbox, { target: { value: 'Jesus' } })
    await waitFor(() => expect(getByRole('list')).toBeInTheDocument())
    await waitFor(() =>
      expect(getAllByText('Levi Meir')[1]).toBeInTheDocument()
    )
  })
})
