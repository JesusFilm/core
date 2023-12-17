import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
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

  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      const { getByRole } = render(
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
      fireEvent.click(getByRole('button', { name: 'Select Image' }))
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith({
          query: { param: 'unsplash-image' },
          push,
          events: {
            on
          }
        })
      })
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })

  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
      const { getByRole } = render(
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
      fireEvent.click(getByRole('button', { name: 'Select Image' }))
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })

  it('triggers onChange', async () => {
    const { getByRole } = render(
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
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })

  it('triggers onChange onPaste', async () => {
    const { getByRole } = render(
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
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    await fireEvent.paste(textBox, {
      clipboardData: { getData: () => 'https://example.com/image.jpg' }
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
