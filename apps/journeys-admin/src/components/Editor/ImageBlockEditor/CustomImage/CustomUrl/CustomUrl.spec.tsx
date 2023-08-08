import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from './CustomUrl'

import { CustomUrl } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
    const { getByRole, getByText } = render(
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

    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    expect(getByText('Paste URL of image...')).toBeInTheDocument()
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onChange).toHaveBeenCalledWith(
      'https://imagedelivery.net/cloudflare-key/uploadId/public'
    )
  })
})
