import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from './CustomUrl'

import { CustomUrl } from '.'

describe('CustomUrl', () => {
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

  it('should submit on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        createCloudflareUploadByUrl: {
          id: 'uploadId',
          __typename: 'CloudflareImage'
        }
      }
    }))
    const onChange = jest.fn()
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
              variables: {
                url: 'https://example.com/image.jpg'
              }
            },
            result
          }
        ]}
      >
        <CustomUrl onChange={onChange} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add image by URL' }))
    expect(screen.getByText('Paste URL of image...')).toBeInTheDocument()
    const textBox = await screen.getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onChange).toHaveBeenCalledWith({
      src: 'https://imagedelivery.net/cloudflare-key/uploadId/public'
    })
  })
})
