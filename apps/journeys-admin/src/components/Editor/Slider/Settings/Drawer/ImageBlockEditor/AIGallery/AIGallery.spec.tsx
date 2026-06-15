import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  CreateAiImage,
  CreateAiImageVariables
} from '../../../../../../../../__generated__/CreateAiImage'
import { SegmindModel } from '../../../../../../../../__generated__/globalTypes'
import { AuthContext, User } from '../../../../../../../libs/auth'
import { GET_MY_CLOUDFLARE_IMAGES } from '../MediaLibrary/MediaLibrary'

import { CREATE_AI_IMAGE } from './AIGallery'

import { AIGallery } from '.'

const authUser = { id: 'me', uid: 'me' } as unknown as User

describe('AIGallery', () => {
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

  const getAIImage: MockedResponse<CreateAiImage, CreateAiImageVariables> = {
    request: {
      query: CREATE_AI_IMAGE,
      variables: {
        prompt: 'an image of the New Jerusalem',
        model: SegmindModel.sdxl1__0_txt2img
      }
    },
    result: {
      data: {
        createImageBySegmindPrompt: {
          __typename: 'CloudflareImage',
          id: 'imageId'
        }
      }
    }
  }

  it('should submit prompt successfully', async () => {
    const onChange = vi.fn()
    render(
      <MockedProvider mocks={[getAIImage]}>
        <SnackbarProvider>
          <AIGallery onChange={onChange} />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), {
      target: { value: 'an image of the New Jerusalem' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prompt' }))
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        alt: 'Prompt: an image of the New Jerusalem',
        src: 'https://imagedelivery.net/cloudflare-key/imageId/public',
        scale: 100,
        focalLeft: 50,
        focalTop: 50,
        customizable: null
      })
    })
  })

  it('should show try again snackbar if results returns null', async () => {
    const emptyResultMock = {
      ...getAIImage,
      result: {
        data: {
          createImageBySegmindPrompt: {
            __typename: 'CloudflareImage',
            id: null
          }
        }
      }
    }
    render(
      <MockedProvider mocks={[emptyResultMock]}>
        <SnackbarProvider>
          <AIGallery onChange={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), {
      target: { value: 'an image of the New Jerusalem' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prompt' }))
    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong, please try again!')
      ).toBeInTheDocument()
    })
  })

  it('should not render the generations grid when mediaLibrary flag is off', () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ mediaLibrary: false }}>
            <AIGallery onChange={vi.fn()} />
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.queryByText('Generations')).not.toBeInTheDocument()
    expect(screen.queryByTestId('MediaLibrary')).not.toBeInTheDocument()
  })

  it('should render the generations grid when mediaLibrary flag is on', async () => {
    const myAiImagesMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 11, isAi: true }
      },
      result: {
        data: {
          getMyCloudflareImages: [
            {
              __typename: 'CloudflareImage',
              id: 'g1',
              url: 'https://imagedelivery.net/key/g1',
              blurhash: null,
              userId: 'me'
            }
          ]
        }
      }
    }
    render(
      <MockedProvider mocks={[myAiImagesMock]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ mediaLibrary: true }}>
            <AIGallery onChange={vi.fn()} />
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Generations')).toBeInTheDocument()
    })
  })

  it('should prepend the new image into the AI grid cache after a successful generation', async () => {
    const myAiImagesMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 11, isAi: true }
      },
      result: {
        data: {
          getMyCloudflareImages: [
            {
              __typename: 'CloudflareImage',
              id: 'existing',
              url: 'https://imagedelivery.net/cloudflare-key/existing',
              blurhash: null,
              userId: 'me'
            }
          ]
        }
      }
    }
    render(
      <AuthContext.Provider value={{ user: authUser }}>
        <MockedProvider mocks={[myAiImagesMock, getAIImage]}>
          <SnackbarProvider>
            <FlagsProvider flags={{ mediaLibrary: true }}>
              <AIGallery onChange={vi.fn()} />
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      </AuthContext.Provider>
    )
    await waitFor(() =>
      expect(
        screen.getByTestId('media-library-image-existing')
      ).toBeInTheDocument()
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), {
      target: { value: 'an image of the New Jerusalem' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prompt' }))
    await waitFor(() =>
      expect(
        screen.getByTestId('media-library-image-imageId')
      ).toBeInTheDocument()
    )
  })

  it('should reset gallery pagination after a successful generation', async () => {
    const makeAiImages = (count: number, offset = 0) =>
      Array.from({ length: count }, (_, i) => ({
        __typename: 'CloudflareImage' as const,
        id: `ai-${offset + i}`,
        url: `https://imagedelivery.net/cloudflare-key/ai-${offset + i}`,
        blurhash: null,
        userId: 'me'
      }))
    const firstPage: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 11, isAi: true }
      },
      result: { data: { getMyCloudflareImages: makeAiImages(11) } }
    }
    const secondPage: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 10, limit: 11, isAi: true }
      },
      result: { data: { getMyCloudflareImages: makeAiImages(11, 10) } }
    }
    const paginatedCache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: { getMyCloudflareImages: offsetLimitPagination(['isAi']) }
        }
      }
    })
    render(
      <AuthContext.Provider value={{ user: authUser }}>
        <MockedProvider
          mocks={[firstPage, secondPage, getAIImage]}
          cache={paginatedCache}
        >
          <SnackbarProvider>
            <FlagsProvider flags={{ mediaLibrary: true }}>
              <AIGallery onChange={vi.fn()} />
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      </AuthContext.Provider>
    )
    await screen.findByTestId('media-library-image-ai-0')
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await screen.findByTestId('media-library-image-ai-11')
    expect(screen.getAllByTestId(/^media-library-image-/)).toHaveLength(20)

    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), {
      target: { value: 'an image of the New Jerusalem' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prompt' }))

    await screen.findByTestId('media-library-image-imageId')
    expect(screen.getAllByTestId(/^media-library-image-/)).toHaveLength(10)
  })

  it('should show error snackbar on request failure', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <AIGallery onChange={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), {
      target: { value: 'an image of the New Jerusalem' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prompt' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
