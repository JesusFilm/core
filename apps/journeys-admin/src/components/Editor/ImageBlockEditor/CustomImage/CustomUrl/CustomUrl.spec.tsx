import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from './CustomUrl'
import { CustomUrl } from '.'

describe('CustomUrl', () => {
  it('should check if the mutation gets called', async () => {
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
    expect(getByText('Paste URL of image...'))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onChange).toHaveBeenCalledWith(
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/uploadId/public'
    )
  })
})
