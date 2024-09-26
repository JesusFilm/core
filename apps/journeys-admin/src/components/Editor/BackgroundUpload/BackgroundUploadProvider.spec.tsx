import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { HttpStack } from 'tus-js-client'

import { useBackgroundUpload } from './BackgroundUploadContext'
import {
  BackgroundUploadProvider,
  CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_CLOUDFLARE_VIDEO_QUERY
} from './BackgroundUploadProvider'
import { TestHttpStack } from './TestHttpStack'

function AddByFile({
  files,
  httpStack
}: {
  files: File[]
  httpStack: HttpStack
}): ReactElement {
  const { uploadCloudflareVideo } = useBackgroundUpload()
  return (
    <>
      <button
        data-testid="upload-button"
        onClick={async () => {
          const upload = uploadCloudflareVideo({
            files: [],
            httpStack: new TestHttpStack()
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
    const testStack = new TestHttpStack()
    const result = jest.fn(() => ({
      data: {
        createCloudflareVideoUploadByFile: {
          id: 'uploadId',
          uploadUrl: 'https://example.com/upload',
          __typename: 'CloudflareVideo'
        }
      }
    }))
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION,
              variables: {
                uploadLength: 4,
                name: 'testFile'
              }
            },
            result
          }
        ]}
      >
        <BackgroundUploadProvider>
          <AddByFile httpStack={testStack} files={} />
        </BackgroundUploadProvider>
      </MockedProvider>
    )
    const button = getByTestId('upload-button')
    fireEvent.click(button)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
