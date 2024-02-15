import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CreateAiImage } from '../../../../../__generated__/CreateAiImage'
import { SegmindModel } from '../../../../../__generated__/globalTypes'

import { AIGallery, CREATE_AI_IMAGE } from './AIGallery'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('AIGallery', () => {
  const getAIImage: MockedResponse<CreateAiImage> = {
    request: {
      query: CREATE_AI_IMAGE,
      variables: {
        prompt: 'an image of the New Jerusalem',
        model: SegmindModel.sdxl1__0_txt2img
      }
    },
    result: jest.fn(() => ({
      data: {
        createImageBySegmindPrompt: {
          __typename: 'CloudflareImage',
          id: 'imageId'
        }
      }
    }))
  }

  afterEach(() => jest.clearAllMocks())

  it('should submit prompt successfully', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[getAIImage]}>
        <SnackbarProvider>
          <AIGallery onChange={onChange} />
        </SnackbarProvider>
      </MockedProvider>
    )

    const promptBox = getByRole('textbox', { name: 'Prompt' })
    const promptSubmitButton = getByRole('button', { name: 'Prompt' })
    await fireEvent.click(promptBox)
    await fireEvent.change(promptBox, {
      target: { value: 'an image of the New Jerusalem' }
    })
    await fireEvent.click(promptSubmitButton)
    await waitFor(() => {
      expect(getAIImage.result).toHaveBeenCalled()
    })
  })

  it('should show try again snackbar if results returns null', async () => {
    const emptyResultMock = {
      ...getAIImage,
      result: jest.fn(() => ({
        data: {
          createImageBySegmindPrompt: {
            __typename: 'CloudflareImage',
            id: null
          }
        }
      }))
    }
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[emptyResultMock]}>
        <SnackbarProvider>
          <AIGallery onChange={jest.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    const promptBox = getByRole('textbox', { name: 'Prompt' })
    const promptSubmitButton = getByRole('button', { name: 'Prompt' })
    await fireEvent.click(promptBox)
    await fireEvent.change(promptBox, {
      target: { value: 'an image of the New Jerusalem' }
    })
    await fireEvent.click(promptSubmitButton)
    await waitFor(() => {
      expect(emptyResultMock.result).toHaveBeenCalled()
      expect(
        getByText('Something went wrong, please try again!')
      ).toBeInTheDocument()
    })
  })

  it('should show error snackbar on request failure', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <AIGallery onChange={jest.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )

    const promptBox = getByRole('textbox', { name: 'Prompt' })
    const promptSubmitButton = getByRole('button', { name: 'Prompt' })
    await fireEvent.click(promptBox)
    await fireEvent.change(promptBox, {
      target: { value: 'an image of the New Jerusalem' }
    })
    await fireEvent.click(promptSubmitButton)
    await waitFor(() => expect(getByRole('alert')).toBeInTheDocument())
  })
})
