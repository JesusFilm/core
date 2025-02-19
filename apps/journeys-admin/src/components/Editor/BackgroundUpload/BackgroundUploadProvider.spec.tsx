import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { useBackgroundUpload } from './BackgroundUploadContext'
import {
  BackgroundUploadProvider,
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY
} from './BackgroundUploadProvider'

function AddByFile({ files }: { files: File[] }): ReactElement {
  const { uploadMuxVideo } = useBackgroundUpload()
  return (
    <>
      <button
        data-testid="upload-button"
        onClick={async () => {
          const upload = uploadMuxVideo({
            files
          })
          await upload.next()
        }}
      >
        Upload
      </button>
    </>
  )
}

describe('BackgroundUploadProvider', () => {
  it('should check if the mutations gets called', async () => {
    const result = jest.fn(() => ({
      data: {
        createMuxVideoUploadByFile: {
          id: 'uploadId',
          uploadUrl: 'https://example.com/upload',
          __typename: 'MuxVideo'
        }
      }
    }))
    const file = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
              variables: {
                name: 'testFile'
              }
            },
            result
          },
          {
            request: {
              query: GET_MY_MUX_VIDEO_QUERY,
              variables: {
                id: 'uploadId'
              }
            },
            result: {
              data: {
                getMyMuxVideo: {
                  id: 'uploadId',
                  playbackId: 'playbackId',
                  readyToStream: true,
                  uploadUrl: 'https://example.com/upload',
                  __typename: 'MuxVideo'
                }
              }
            }
          }
        ]}
      >
        <BackgroundUploadProvider>
          <AddByFile files={[file]} />
        </BackgroundUploadProvider>
      </MockedProvider>
    )
    const button = getByTestId('upload-button')
    fireEvent.click(button)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
