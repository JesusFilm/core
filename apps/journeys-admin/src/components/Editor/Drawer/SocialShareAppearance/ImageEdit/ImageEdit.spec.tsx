import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../__generated__/GetJourney'
import { createCloudflareUploadByUrlMock } from '../../../ImageBlockEditor/CustomImage/CustomUrl/data'
import { SocialProvider } from '../../../SocialProvider'

import {
  BLOCK_DELETE_PRIMARY_IMAGE,
  ImageEdit,
  JOURNEY_PRIMARY_IMAGE_UPDATE,
  PRIMARY_IMAGE_BLOCK_CREATE
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
    blurhash: ''
  }

  it('should disaply placeholder icon when no image set', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <SocialProvider>
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
        </SocialProvider>
      </MockedProvider>
    )
    expect(getAllByTestId('EditIcon')).toHaveLength(1)
  })

  it('should display the primaryImage', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SocialProvider>
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
              <ImageEdit />
            </JourneyProvider>
          </SnackbarProvider>
        </SocialProvider>
      </MockedProvider>
    )
    expect(getByRole('img')).toBeInTheDocument()
  })

  it('create the primaryImage', async () => {
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

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          createCloudflareUploadByUrlMock,
          {
            request: {
              query: PRIMARY_IMAGE_BLOCK_CREATE,
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
              query: JOURNEY_PRIMARY_IMAGE_UPDATE,
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
        <SocialProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { id: 'journey.id' } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ImageEdit />
            </JourneyProvider>
          </SnackbarProvider>
        </SocialProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)

    await waitFor(() => expect(getByRole('progressbar')).toBeInTheDocument())
    await waitFor(() => expect(imageBlockResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
      { __ref: 'ImageBlock:image1.id' }
    ])
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

    const { getByRole, getByTestId } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: BLOCK_DELETE_PRIMARY_IMAGE,
              variables: {
                id: image.id,
                journeyId: 'journey.id'
              }
            },
            result: imageDeleteResult
          },
          {
            request: {
              query: JOURNEY_PRIMARY_IMAGE_UPDATE,
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
        <SocialProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journey.id',
                  primaryImageBlock: { ...image }
                } as unknown as Journey,
                variant: 'admin'
              }}
            >
              <ImageEdit />
            </JourneyProvider>
          </SnackbarProvider>
        </SocialProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByTestId('imageBlockHeaderDelete'))
    await waitFor(() => expect(imageDeleteResult).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdateResult).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([])
  })
})
