import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE } from './AddByFile'
import { TestHttpStack } from './TestHttpStack'
import { AddByFile } from '.'

describe('AddByFile', () => {
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
    const onChange = jest.fn()
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE,
              variables: {
                uploadLength: 4,
                name: 'testFile'
              }
            },
            result
          }
        ]}
      >
        <AddByFile onChange={onChange} httpStack={testStack} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should complete a file upload and call onChange', async () => {
    const testStack = new TestHttpStack()
    const onChange = jest.fn()
    const { getByTestId, getByText, getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE,
              variables: {
                uploadLength: 4,
                name: 'testFile'
              }
            },
            result: {
              data: {
                createCloudflareVideoUploadByFile: {
                  id: 'uploadId',
                  uploadUrl: 'https://example.com/upload',
                  __typename: 'CloudflareVideo'
                }
              }
            }
          }
        ]}
      >
        <AddByFile onChange={onChange} httpStack={testStack} />
      </MockedProvider>
    )
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(getByText('Uploading...')).toBeInTheDocument())
    expect(getByTestId('BackupOutlinedIcon')).toBeInTheDocument()
    let req = await testStack.nextRequest()
    expect(req.getURL()).toEqual('https://example.com/upload')
    expect(req.getMethod()).toEqual('HEAD')
    req.respondWith({
      status: 200,
      responseHeaders: {
        'Upload-Length': '16315',
        'Upload-Offset': '0'
      }
    })
    req = await testStack.nextRequest()
    expect(req.getURL()).toEqual('https://example.com/upload')
    expect(req.getMethod()).toEqual('PATCH')
    req.respondWith({
      status: 204,
      responseHeaders: {
        'Upload-Offset': '3263'
      }
    })
    await waitFor(() =>
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20')
    )
    req = await testStack.nextRequest()
    expect(req.getURL()).toEqual('https://example.com/upload')
    expect(req.getMethod()).toEqual('PATCH')
    req.respondWith({
      status: 204,
      responseHeaders: {
        'Upload-Offset': '16315'
      }
    })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('uploadId'))
  })

  it('should show error state', async () => {
    const testStack = new TestHttpStack()
    const onChange = jest.fn()
    const { getByTestId, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE,
              variables: {
                uploadLength: 4,
                name: 'testFile'
              }
            },
            result: {
              data: {
                createCloudflareVideoUploadByFile: {
                  id: 'uploadId',
                  uploadUrl: 'https://example.com/upload',
                  __typename: 'CloudflareVideo'
                }
              }
            }
          }
        ]}
      >
        <AddByFile onChange={onChange} httpStack={testStack} />
      </MockedProvider>
    )
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(getByText('Uploading...')).toBeInTheDocument())
    expect(getByTestId('BackupOutlinedIcon')).toBeInTheDocument()
    const req = await testStack.nextRequest()
    expect(req.getURL()).toEqual('https://example.com/upload')
    expect(req.getMethod()).toEqual('HEAD')
    req.respondWith({
      status: 404
    })
    await waitFor(() =>
      expect(getByText('Something went wrong, try again')).toBeInTheDocument()
    )
    expect(getByTestId('WarningAmberRoundedIcon')).toBeInTheDocument()
  })
})
