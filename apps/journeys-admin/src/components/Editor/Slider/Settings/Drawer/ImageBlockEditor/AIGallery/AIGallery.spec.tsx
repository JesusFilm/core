import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  CreateAiImage,
  CreateAiImageVariables
} from '../../../../../../../../__generated__/CreateAiImage'
import { SegmindModel } from '../../../../../../../../__generated__/globalTypes'
import { GET_MY_CLOUDFLARE_IMAGES } from '../MediaLibraryImagesGrid'

import { CREATE_AI_IMAGE } from './AIGallery'

import { AIGallery } from '.'

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
    const onChange = jest.fn()
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
          <AIGallery onChange={jest.fn()} />
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
            <AIGallery onChange={jest.fn()} />
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.queryByText('Your generations')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('MediaLibraryImagesGrid')
    ).not.toBeInTheDocument()
  })

  it('should render the generations grid when mediaLibrary flag is on', async () => {
    const myAiImagesMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 9, isAi: true }
      },
      result: {
        data: {
          getMyCloudflareImages: [
            {
              __typename: 'CloudflareImage',
              id: 'g1',
              url: 'https://imagedelivery.net/key/g1',
              blurhash: null
            }
          ]
        }
      }
    }
    render(
      <MockedProvider mocks={[myAiImagesMock]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ mediaLibrary: true }}>
            <AIGallery onChange={jest.fn()} />
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Your generations')).toBeInTheDocument()
    })
  })

  it('should refetch GetMyCloudflareImages after a successful AI generation', async () => {
    let refetchCount = 0
    const myAiImagesMock: MockedResponse = {
      request: {
        query: GET_MY_CLOUDFLARE_IMAGES,
        variables: { offset: 0, limit: 9, isAi: true }
      },
      newData: () => {
        refetchCount += 1
        return {
          data: {
            getMyCloudflareImages: []
          }
        }
      }
    }
    render(
      <MockedProvider mocks={[getAIImage, myAiImagesMock, myAiImagesMock]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ mediaLibrary: true }}>
            <AIGallery onChange={jest.fn()} />
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(refetchCount).toBeGreaterThanOrEqual(1))
    const initialCount = refetchCount
    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), {
      target: { value: 'an image of the New Jerusalem' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Prompt' }))
    await waitFor(() => expect(refetchCount).toBeGreaterThan(initialCount))
  })

  it('should show error snackbar on request failure', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <AIGallery onChange={jest.fn()} />
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
