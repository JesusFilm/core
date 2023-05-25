import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL } from './AddByUrl'
import { AddByUrl } from '.'

describe('AddByUrl', () => {
  it('should check if the mutation gets called', async () => {
    const result = jest.fn(() => ({
      data: {
        createCloudflareVideoUploadByUrl: {
          id: 'uploadId',
          __typename: 'CloudflareVideo'
        }
      }
    }))
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL,
              variables: {
                url: 'https://example.com/video.mp4'
              }
            },
            result
          }
        ]}
      >
        <AddByUrl onChange={onChange} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Add video by URL' }))
    expect(getByText('Paste URL of video...'))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/video.mp4' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onChange).toHaveBeenCalledWith('uploadId')
  })
})
