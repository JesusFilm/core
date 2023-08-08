import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, waitFor } from '@testing-library/react'

import {
  CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_CLOUDFLARE_VIDEO_QUERY
} from './AddByFile'
import { TestHttpStack } from './TestHttpStack'

import { AddByFile } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION,
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
          },
          {
            request: {
              query: GET_MY_CLOUDFLARE_VIDEO_QUERY,
              variables: {
                id: 'uploadId'
              }
            },
            result: {
              data: {
                getMyCloudflareVideo: {
                  id: 'uploadId',
                  readyToStream: true,
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
    expect(req.getURL()).toBe('https://example.com/upload')
    expect(req.getMethod()).toBe('HEAD')
    req.respondWith({
      status: 200,
      responseHeaders: {
        'Upload-Length': '16315',
        'Upload-Offset': '0'
      }
    })

    await act(async () => {
      req = await testStack.nextRequest()
    })

    expect(req.getURL()).toBe('https://example.com/upload')
    expect(req.getMethod()).toBe('PATCH')
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
    expect(req.getURL()).toBe('https://example.com/upload')
    expect(req.getMethod()).toBe('PATCH')
    req.respondWith({
      status: 204,
      responseHeaders: {
        'Upload-Offset': '16315'
      }
    })
    await waitFor(() => expect(getByText('Processing...')).toBeInTheDocument())
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
              query: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION,
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
    expect(req.getURL()).toBe('https://example.com/upload')
    expect(req.getMethod()).toBe('HEAD')
    req.respondWith({
      status: 404
    })
    await waitFor(() =>
      expect(getByText('Something went wrong, try again')).toBeInTheDocument()
    )
    expect(getByTestId('WarningAmberRoundedIcon')).toBeInTheDocument()
  })

  it('should show error state on fileRejections', async () => {
    const testStack = new TestHttpStack()
    const onChange = jest.fn()
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
    const file1 = new File(['file'], 'testFile.mp4', {
      type: 'video/mp4'
    })
    const file2 = new File(['file'], 'testFile.png', {
      type: 'video/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file1, file2]
    })

    await act(async () => {
      fireEvent.drop(input)
    })

    expect(getByTestId('WarningAmberRoundedIcon')).toBeInTheDocument()
  })
})
