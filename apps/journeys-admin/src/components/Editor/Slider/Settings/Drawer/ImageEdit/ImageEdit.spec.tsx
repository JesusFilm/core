import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { createCloudflareUploadByUrlMock } from '../ImageBlockEditor/CustomImage/CustomUrl/data'
import { listUnsplashCollectionPhotosMock } from '../ImageBlockEditor/UnsplashGallery/data'

import {
  ImageEdit,
  JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
  JOURNEY_IMAGE_BLOCK_CREATE,
  JOURNEY_IMAGE_BLOCK_DELETE,
  JOURNEY_IMAGE_BLOCK_UPDATE
} from './ImageEdit'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageEdit', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const image: ImageBlock = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: 0,
    src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
    alt: 'public',
    width: 1920,
    height: 1080,
    blurhash: '',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  }

  it('should disaply placeholder icon when no image set', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { primaryImageBlockId: null } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getAllByTestId('Edit2Icon')).toHaveLength(1)
  })

  it('should display the primaryImage', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                primaryImageBlock: {
                  src: 'img.src',
                  alt: 'image.alt'
                }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit size="small" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('creates the primaryImage', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [],
        id: 'journey.id',
        __typename: 'Journey'
      }
    })

    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          __typename: 'ImageBlock',
          id: image.id,
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))

    const journeyResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journey.id',
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          },
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  primaryImageBlockId: image.id
                }
              }
            },
            result: journeyResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journey.id',
                hostname: null,
                slug: 'journey-id'
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    )
    const textBox = screen.getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    )
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyResult).toHaveBeenCalled())
  })

  it('creates the creator image', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [],
        id: 'journey.id',
        __typename: 'Journey'
      }
    })

    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          __typename: 'ImageBlock',
          id: image.id,
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))

    const journeyResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journey.id',
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          },
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  creatorImageBlockId: image.id
                }
              }
            },
            result: journeyResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit target="creator" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    )
    const textBox = screen.getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    )
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyResult).toHaveBeenCalled())
  })

  it('delete the primaryImage', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [{ __ref: `ImageBlock:${image.id}` }],
        id: 'journey.id',
        __typename: 'Journey',
        primaryImageBlock: {
          __ref: `ImageBlock:${image.id}`
        }
      },
      'ImageBlock:image1.id': {
        ...image
      }
    })

    const imageDeleteResult = jest.fn(() => ({
      data: {
        blockDelete: []
      }
    }))

    const journeyUpdateResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          listUnsplashCollectionPhotosMock,
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_DELETE,
              variables: {
                id: image.id,
                journeyId: 'journey.id'
              }
            },
            result: imageDeleteResult
          },
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  primaryImageBlockId: null
                }
              }
            },
            result: journeyUpdateResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journey.id',
                hostname: null,
                slug: 'journey-id',
                primaryImageBlock: { ...image }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
    await waitFor(() => expect(imageDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdateResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([])
  })

  it('delete the creator image', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ['Journey:' + 'journey.id']: {
        blocks: [{ __ref: `ImageBlock:${image.id}` }],
        id: 'journey.id',
        __typename: 'Journey',
        primaryImageBlock: {
          __ref: `ImageBlock:${image.id}`
        }
      },
      'ImageBlock:image1.id': {
        ...image
      }
    })

    const imageDeleteResult = jest.fn(() => ({
      data: {
        blockDelete: []
      }
    }))

    const journeyUpdateResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journey.id',
          hostname: null,
          slug: 'journey-id',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          listUnsplashCollectionPhotosMock,
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_DELETE,
              variables: {
                id: image.id,
                journeyId: 'journey.id'
              }
            },
            result: imageDeleteResult
          },
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
              variables: {
                id: 'journey.id',
                input: {
                  creatorImageBlockId: null
                }
              }
            },
            result: journeyUpdateResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journey.id',
                hostname: null,
                slug: 'journey-id',
                creatorImageBlock: { ...image }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit target="creator" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
    )
    await waitFor(() => expect(imageDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdateResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([])
  })

  it('updates the image', async () => {
    const imageBlockResultForUpdateMock = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          __typename: 'ImageBlock',
          id: image.id,
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          listUnsplashCollectionPhotosMock,
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_UPDATE,
              variables: {
                id: image.id,
                journeyId: 'journey.id',
                input: {
                  src: image.src,
                  alt: 'public'
                }
              }
            },
            result: imageBlockResultForUpdateMock
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journey.id',
                hostname: null,
                slug: 'journey-id',
                primaryImageBlock: {
                  ...image,
                  src: 'https://imagedelivery.net/cloudflare-key/uploadId/public2'
                }
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <ImageEdit />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    )
    const textBox = screen.getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(imageBlockResultForUpdateMock).toHaveBeenCalled()
    )
  })
})
