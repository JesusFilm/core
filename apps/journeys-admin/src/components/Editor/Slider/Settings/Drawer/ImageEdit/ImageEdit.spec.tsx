import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  JourneyImageBlockCreate,
  JourneyImageBlockCreateVariables
} from '../../../../../../../__generated__/JourneyImageBlockCreate'
import {
  JourneyImageBlockUpdate,
  JourneyImageBlockUpdateVariables
} from '../../../../../../../__generated__/JourneyImageBlockUpdate'
import { JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE } from '../../../../../../libs/useJourneyImageBlockAssociationUpdateMutation'
import { JOURNEY_IMAGE_BLOCK_CREATE } from '../../../../../../libs/useJourneyImageBlockCreateMutation'
import { JOURNEY_IMAGE_BLOCK_DELETE } from '../../../../../../libs/useJourneyImageBlockDeleteMutation'
import { JOURNEY_IMAGE_BLOCK_UPDATE } from '../../../../../../libs/useJourneyImageBlockUpdateMutation'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock
} from '../ImageBlockEditor/UnsplashGallery/data'

import { ImageEdit } from './ImageEdit'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageEdit', () => {
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
    focalTop: 50,
    customizable: null
  }

  const unsplashImageInput = {
    src: 'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
    alt: 'white dome building during daytime',
    blurhash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
    height: 720,
    width: 1080,
    scale: 100,
    focalLeft: 50,
    focalTop: 50,
    customizable: null
  }

  function getJourneyImageBlockCreateMock(): MockedResponse<
    JourneyImageBlockCreate,
    JourneyImageBlockCreateVariables
  > {
    return {
      request: {
        query: JOURNEY_IMAGE_BLOCK_CREATE,
        variables: {
          input: {
            journeyId: 'journey.id',
            ...unsplashImageInput
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          imageBlockCreate: {
            ...image,
            ...unsplashImageInput
          }
        }
      }))
    }
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

  it.each([
    ['primary', 'primaryImageBlockId'],
    ['creator', 'creatorImageBlockId']
  ] as const)(
    'creates the %s image from gallery selection',
    async (target, field) => {
      const imageBlockCreateMock = getJourneyImageBlockCreateMock()
      const journeyUpdateResult = jest.fn(() => ({
        data: {
          journeyUpdate: {
            __typename: 'Journey',
            id: 'journey.id',
            [field]: {
              id: image.id
            }
          }
        }
      }))

      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            triggerUnsplashDownloadMock,
            imageBlockCreateMock,
            {
              request: {
                query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
                variables: {
                  id: 'journey.id',
                  input: {
                    [field]: image.id
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
                  slug: 'journey-id'
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ImageEdit target={target} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button'))
      await waitFor(() =>
        expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'white dome building during daytime'
        })
      )

      await waitFor(() =>
        expect(imageBlockCreateMock.result).toHaveBeenCalled()
      )
      await waitFor(() => expect(journeyUpdateResult).toHaveBeenCalled())
    }
  )

  it.each([
    ['primary', 'primaryImageBlock'],
    ['creator', 'creatorImageBlock']
  ] as const)(
    'updates the %s image from gallery selection',
    async (target, field) => {
      const updateResult = jest.fn(() => ({
        data: {
          imageBlockUpdate: {
            ...image,
            ...unsplashImageInput
          }
        }
      }))
      const imageBlockUpdateMock: MockedResponse<
        JourneyImageBlockUpdate,
        JourneyImageBlockUpdateVariables
      > = {
        request: {
          query: JOURNEY_IMAGE_BLOCK_UPDATE,
          variables: {
            id: image.id,
            journeyId: 'journey.id',
            input: unsplashImageInput
          }
        },
        result: updateResult
      }

      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            triggerUnsplashDownloadMock,
            imageBlockUpdateMock
          ]}
        >
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journey.id',
                  hostname: null,
                  slug: 'journey-id',
                  [field]: image
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ImageEdit target={target} />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button'))
      await waitFor(() =>
        expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'white dome building during daytime'
        })
      )

      await waitFor(() => expect(updateResult).toHaveBeenCalled())
    }
  )

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
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('imageBlockHeaderDelete'))
    )
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
})
