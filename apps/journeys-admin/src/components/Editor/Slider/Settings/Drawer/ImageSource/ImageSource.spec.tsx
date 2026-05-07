import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

import { ImageSource } from './ImageSource'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ImageSource', () => {
  const onChange = jest.fn()
  const onDelete = jest.fn()
  const push = jest.fn()
  const on = jest.fn()
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: null,
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

  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
  })

  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageSource
              selectedBlock={null}
              onChange={onChange}
              onDelete={onDelete}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Select Image' }))
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            query: { param: 'unsplash-image' }
          },
          undefined,
          { shallow: true }
        )
      })
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      expect(screen.getByTestId('ImageUpload')).toBeInTheDocument()
    })
  })

  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageSource
              selectedBlock={imageBlock}
              onChange={onChange}
              onDelete={onDelete}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'public Selected Image 1920 x 1080 pixels'
        })
      )
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      expect(screen.getByTestId('ImageUpload')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
    })
  })
})
