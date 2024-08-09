import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { createCloudflareUploadByUrlMock } from '../ImageBlockEditor/CustomImage/CustomUrl/data'

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

  let originalEnv

  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
  })

  afterEach(() => {
    process.env = originalEnv
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
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })

  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
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
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      await waitFor(() =>
        fireEvent.click(
          screen.getByRole('button', { name: 'Add image by URL' })
        )
      )
      const textBox = await screen.getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })

  it('triggers onChange', async () => {
    render(
      <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
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
    await waitFor(() =>
      fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    )
    const textBox = await screen.getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })

  it('triggers onChange onPaste', async () => {
    render(
      <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
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
    await waitFor(() =>
      fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    )
    const textBox = await screen.getByRole('textbox')
    await fireEvent.paste(textBox, {
      clipboardData: { getData: () => 'https://example.com/image.jpg' }
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
