import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  BackgroundUploadProvider,
  useBackgroundUpload
} from '../../../../../../BackgroundUpload'

import { AddByFile } from '.'

jest.mock('../../../../../../BackgroundUpload/BackgroundUploadContext', () => ({
  useBackgroundUpload: jest.fn().mockImplementation(() => ({
    uploadCloudflareVideo: jest.fn(),
    uploadQueue: {}
  }))
}))

describe('AddByFile', () => {
  it('should check if the mutations gets called', async () => {
    const onChange = jest.fn()
    const { getByTestId } = render(
      <BackgroundUploadProvider>
        <AddByFile onChange={onChange} />
      </BackgroundUploadProvider>
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
    await waitFor(() =>
      expect(useBackgroundUpload().uploadCloudflareVideo).toHaveBeenCalled()
    )
  })

  it('should start uploading on a file drop', async () => {
    render(
      <MockedProvider
        mocks={[createCloudflareVideoMock, getCloudflareVideoMock]}
      >
        <AddByFile onChange={jest.fn()} />
      </MockedProvider>
    )
    await dropTestVideo()
    await waitFor(() =>
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    )
    expect(screen.getByTestId('Upload1Icon')).toBeInTheDocument()
  })

  it('should complete a file upload and call onChange', async () => {
    const onChange = jest.fn()
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <BackgroundUploadProvider>
          <AddByFile onChange={onChange} />
        </BackgroundUploadProvider>
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
    expect(getByTestId('Upload1Icon')).toBeInTheDocument()
    // let req = await testStack.nextRequest()
    // expect(req.getURL()).toBe('https://example.com/upload')
    // expect(req.getMethod()).toBe('HEAD')
    // req.respondWith({
    //   status: 200,
    //   responseHeaders: {
    //     'Upload-Length': '16315',
    //     'Upload-Offset': '0'
    //   }
    // })

    // await act(async () => {
    //   req = await testStack.nextRequest()
    // })

    // expect(req.getURL()).toBe('https://example.com/upload')
    // expect(req.getMethod()).toBe('PATCH')
    // req.respondWith({
    //   status: 204,
    //   responseHeaders: {
    //     'Upload-Offset': '3263'
    //   }
    // })
    // await waitFor(() =>
    //   expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20')
    // )
    // req = await testStack.nextRequest()
    // expect(req.getURL()).toBe('https://example.com/upload')
    // expect(req.getMethod()).toBe('PATCH')
    // req.respondWith({
    //   status: 204,
    //   responseHeaders: {
    //     'Upload-Offset': '16315'
    //   }
    // })
    // await waitFor(() => expect(getByText('Processing...')).toBeInTheDocument())
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('uploadId'))
  })

  it('should finish processing after upload', async () => {
    const testStack = new TestHttpStack()
    const onChange = jest.fn()
    render(
      <MockedProvider
        mocks={[createCloudflareVideoMock, getCloudflareVideoMock]}
      >
        <AddByFile onChange={onChange} httpStack={testStack} />
      </MockedProvider>
    )
    await dropTestVideo()
    await completeUpload(testStack)
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('uploadId'))
    await waitFor(() =>
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
    )
    expect(screen.queryByText('Uploading...')).not.toBeInTheDocument()
  })

  it('should show error state', async () => {
    const testStack = new TestHttpStack()
    const onChange = jest.fn()
    const { getByTestId, getByText, getAllByTestId } = render(
      <MockedProvider>
        <BackgroundUploadProvider>
          <AddByFile onChange={onChange} httpStack={testStack} />
        </BackgroundUploadProvider>
      </MockedProvider>
    )
    await dropTestVideo()

    await waitFor(() =>
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    )
    expect(screen.getByTestId('Upload1Icon')).toBeInTheDocument()
    const req = await testStack.nextRequest()
    expect(req.getURL()).toBe('https://example.com/upload')
    expect(req.getMethod()).toBe('HEAD')
    req.respondWith({
      status: 404
    })
    await waitFor(() =>
      expect(
        screen.getByText('Something went wrong, try again')
      ).toBeInTheDocument()
    )
    expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
  })

  it('should show error state on fileRejections', async () => {
    const onChange = jest.fn()
    const { getByTestId, getAllByTestId } = render(
      <MockedProvider>
        <BackgroundUploadProvider>
          <AddByFile onChange={onChange} />
        </BackgroundUploadProvider>
      </MockedProvider>
    )
    const input = screen.getByTestId('drop zone')
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

    expect(screen.getAllByTestId('AlertTriangleIcon')).toHaveLength(2)
  })
})
