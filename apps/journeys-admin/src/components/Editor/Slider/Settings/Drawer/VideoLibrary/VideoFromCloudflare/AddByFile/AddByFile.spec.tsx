import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { createCloudflareVideoMock, getCloudflareVideoMock } from './data'
import { TestHttpStack } from './TestHttpStack'

import { AddByFile } from '.'

async function dropTestVideo(): Promise<void> {
  const input = screen.getByTestId('drop zone')
  const file = new File(['file'], 'testFile.mp4', {
    type: 'video/mp4'
  })
  Object.defineProperty(input, 'files', {
    value: [file]
  })
  await act(async () => {
    fireEvent.drop(input)
  })
}

async function completeUpload(testStack: TestHttpStack): Promise<void> {
  let req
  await act(async () => {
    req = await testStack.nextRequest()
  })
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

  await act(async () => {
    req = await testStack.nextRequest()
  })
  expect(req.getURL()).toBe('https://example.com/upload')
  expect(req.getMethod()).toBe('PATCH')
  req.respondWith({
    status: 204,
    responseHeaders: {
      'Upload-Offset': '16315'
    }
  })
}

describe('AddByFile', () => {
  it('should clear errors on start upload', async () => {
    const result = jest.fn().mockReturnValue(createCloudflareVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...createCloudflareVideoMock, result }]}>
        <AddByFile onChange={jest.fn()} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    await dropTestVideo()
    await waitFor(() =>
      expect(screen.queryByText('Upload Failed!')).not.toBeInTheDocument()
    )
  })

  it('should check if the mutations gets called', async () => {
    const result = jest.fn().mockReturnValue(createCloudflareVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...createCloudflareVideoMock, result }]}>
        <AddByFile onChange={jest.fn()} httpStack={new TestHttpStack()} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    await dropTestVideo()
    await waitFor(() => expect(result).toHaveBeenCalled())
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
    await waitFor(() =>
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    )
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
    render(
      <MockedProvider mocks={[createCloudflareVideoMock]}>
        <AddByFile onChange={jest.fn()} httpStack={testStack} />
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
    const testStack = new TestHttpStack()
    render(
      <MockedProvider mocks={[createCloudflareVideoMock]}>
        <AddByFile onChange={jest.fn()} httpStack={testStack} />
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
