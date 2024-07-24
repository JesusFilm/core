import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { AIGallery } from '.'
import {
  CreateAiImage,
  CreateAiImageVariables
} from '../../../../../../../../__generated__/CreateAiImage'
import { SegmindModel } from '../../../../../../../../__generated__/globalTypes'
import { CREATE_AI_IMAGE } from './AIGallery'

describe('AIGallery', () => {
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

  afterEach(() => jest.clearAllMocks())

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
        src: 'https://imagedelivery.net//imageId/public'
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
