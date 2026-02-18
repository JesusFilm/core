import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  ListUnsplashCollectionPhotos,
  ListUnsplashCollectionPhotosVariables
} from '../../../../../../../../__generated__/ListUnsplashCollectionPhotos'
import {
  SearchUnsplashPhotos_searchUnsplashPhotos_results as Result,
  SearchUnsplashPhotos,
  SearchUnsplashPhotosVariables
} from '../../../../../../../../__generated__/SearchUnsplashPhotos'
import {
  TriggerUnsplashDownload,
  TriggerUnsplashDownloadVariables
} from '../../../../../../../../__generated__/TriggerUnsplashDownload'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import {
  LIST_UNSPLASH_COLLECTION_PHOTOS,
  SEARCH_UNSPLASH_PHOTOS
} from './UnsplashGallery'
import { TRIGGER_UNSPLASH_DOWNLOAD } from './UnsplashList/UnsplashList'

import { UnsplashGallery } from '.'

describe('UnsplashGallery', () => {
  const item: Result = {
    id: '1',
    alt_description: 'white dome building during daytime',
    blur_hash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
    width: 6240,
    height: 4160,
    urls: {
      raw: 'https://images.unsplash.com/photo-1?ixid=1',
      regular: 'https://images.unsplash.com/photo-1?ixid=1&q=80&w=1080',
      __typename: 'UnsplashPhotoUrls'
    },
    links: {
      download_location: 'https://api.unsplash.com/photos/1/download?ixid=1',
      __typename: 'UnsplashPhotoLinks'
    },
    user: {
      first_name: 'Levi Meir',
      last_name: 'Clancy',
      username: 'levimeirclancy',
      __typename: 'UnsplashUser'
    },
    __typename: 'UnsplashPhoto'
  }

  const listUnsplashCollectionPhotosMock: MockedResponse<
    ListUnsplashCollectionPhotos,
    ListUnsplashCollectionPhotosVariables
  > = {
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
        listUnsplashCollectionPhotos: [item]
      }
    }
  }

  const searchUnsplashPhotosMock: MockedResponse<
    SearchUnsplashPhotos,
    SearchUnsplashPhotosVariables
  > = {
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
          results: [item, { ...item, id: '2' }],
          __typename: 'UnsplashQueryResponse'
        }
      }
    }
  }

  const triggerUnsplashDownloadMock: MockedResponse<
    TriggerUnsplashDownload,
    TriggerUnsplashDownloadVariables
  > = {
    request: {
      query: TRIGGER_UNSPLASH_DOWNLOAD,
      variables: {
        url: 'https://api.unsplash.com/photos/1/download?ixid=1'
      }
    },
    result: {
      data: {
        triggerUnsplashDownload: true
      }
    }
  }

  it('should return a collection of images from unsplash', async () => {
    const handleChange = jest.fn()
    render(
      <MockedProvider
        mocks={[listUnsplashCollectionPhotosMock, triggerUnsplashDownloadMock]}
      >
        <UnsplashGallery selectedBlock={null} onChange={handleChange} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByAltText('white dome building during daytime')
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByAltText('white dome building during daytime'))
    expect(handleChange).toHaveBeenCalledWith({
      alt: 'white dome building during daytime',
      blurhash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
      height: 720,
      src: 'https://images.unsplash.com/photo-1?ixid=1&q=80&w=1080',
      width: 1080,
      scale: 100,
      focalLeft: 50,
      focalTop: 50
    })
  })

  it('should highlight selected block image', async () => {
    render(
      <MockedProvider mocks={[listUnsplashCollectionPhotosMock]}>
        <ThemeProvider>
          <UnsplashGallery
            selectedBlock={{ src: item.urls.regular } as unknown as ImageBlock}
            onChange={jest.fn()}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('image-1')).toHaveStyle(
        'outline-color: #C52D3A'
      )
    )
  })

  it('should search images from unsplash', async () => {
    const result = jest.fn().mockReturnValue(searchUnsplashPhotosMock.result)
    render(
      <MockedProvider
        mocks={[
          listUnsplashCollectionPhotosMock,
          {
            ...searchUnsplashPhotosMock,
            result
          }
        ]}
      >
        <UnsplashGallery onChange={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'UnsplashSearch' }), {
      target: { value: 'Jesus' }
    })
    await waitFor(() =>
      expect(screen.getByTestId('image-2')).toBeInTheDocument()
    )
    expect(result).toHaveBeenCalled()
  })

  it('should update search field once chip is selected', async () => {
    const result = jest
      .fn()
      .mockReturnValue(listUnsplashCollectionPhotosMock.result)
    render(
      <MockedProvider
        mocks={[
          listUnsplashCollectionPhotosMock,
          searchUnsplashPhotosMock,
          {
            ...listUnsplashCollectionPhotosMock,
            request: {
              ...listUnsplashCollectionPhotosMock.request,
              variables: {
                ...listUnsplashCollectionPhotosMock.request.variables,
                collectionId: 'uOF0tIcPnUA'
              }
            },
            result
          }
        ]}
      >
        <UnsplashGallery onChange={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'UnsplashSearch' }), {
      target: { value: 'Jesus' }
    })
    await waitFor(() =>
      expect(screen.getByTestId('image-2')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Church' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByRole('textbox', { name: 'UnsplashSearch' })).toHaveValue(
      ''
    )
  })

  it('should fetch more images from unsplash', async () => {
    const result = jest
      .fn()
      .mockReturnValue(listUnsplashCollectionPhotosMock.result)
    render(
      <MockedProvider
        mocks={[
          listUnsplashCollectionPhotosMock,
          {
            ...listUnsplashCollectionPhotosMock,
            request: {
              ...listUnsplashCollectionPhotosMock.request,
              variables: {
                ...listUnsplashCollectionPhotosMock.request.variables,
                page: 2
              }
            },
            result
          }
        ]}
      >
        <UnsplashGallery onChange={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('image-1')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should fetch more images from unsplash search', async () => {
    const result = jest.fn().mockReturnValue(searchUnsplashPhotosMock.result)
    render(
      <MockedProvider
        mocks={[
          listUnsplashCollectionPhotosMock,
          searchUnsplashPhotosMock,
          {
            ...searchUnsplashPhotosMock,
            request: {
              ...searchUnsplashPhotosMock.request,
              variables: {
                ...searchUnsplashPhotosMock.request.variables,
                page: 2
              }
            },
            result
          }
        ]}
      >
        <UnsplashGallery onChange={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'UnsplashSearch' }), {
      target: { value: 'Jesus' }
    })
    await waitFor(() =>
      expect(screen.getByTestId('image-2')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
