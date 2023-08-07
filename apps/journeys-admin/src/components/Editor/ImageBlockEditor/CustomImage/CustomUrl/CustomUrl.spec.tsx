import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from './CustomUrl'
import { CustomUrl } from '.'

describe('CustomUrl', () => {
  let originalEnv

  const result = jest.fn(() => ({
    data: {
      createCloudflareUploadByUrl: {
        id: 'uploadId',
        __typename: 'CloudflareImage'
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
        variables: {
          url: 'https://example.com/image.jpg'
        }
      },
      result
    }
  ]

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

  it('should check if the mutation gets called', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider mocks={mocks}>
        <CustomUrl onChange={onChange} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    expect(getByText('Paste URL of image...'))
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

  it('should submit when enter is pressed', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider mocks={mocks}>
        <CustomUrl onChange={onChange} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    expect(getByText('Paste URL of image...'))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.submit(textBox)
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onChange).toHaveBeenCalledWith(
      'https://imagedelivery.net/cloudflare-key/uploadId/public'
    )
  })
})
