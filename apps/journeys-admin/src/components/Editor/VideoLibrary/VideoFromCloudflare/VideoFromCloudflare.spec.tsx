import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL } from './AddByUrl/AddByUrl'
import { VideoFromCloudflare } from '.'

describe('VideoFromCloudflare', () => {
  it('should call onSelect when video uploaded', async () => {
    const onSelect = jest.fn()
    const result = jest.fn(() => ({
      data: {
        createCloudflareVideoUploadByUrl: {
          id: 'uploadId',
          __typename: 'CloudflareVideo'
        }
      }
    }))
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
        <VideoFromCloudflare onSelect={onSelect} />
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
    expect(onSelect).toHaveBeenCalledWith({
      source: VideoBlockSource.cloudflare,
      startAt: 0,
      videoId: 'uploadId'
    })
  })
})
