import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { createMuxVideoMock, getMuxVideoMock } from './data'

import { AddByFile } from '.'

jest.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: () => ({
      on: () => jest.fn()
    })
  }
}))

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

describe('AddByFile', () => {
  it('should clear errors on start upload', async () => {
    const result = jest.fn().mockReturnValue(createMuxVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...createMuxVideoMock, result }]}>
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
    const result = jest.fn().mockReturnValue(createMuxVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...createMuxVideoMock, result }]}>
        <AddByFile onChange={jest.fn()} />
      </MockedProvider>
    )
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    await dropTestVideo()
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should start uploading on a file drop', async () => {
    render(
      <MockedProvider mocks={[createMuxVideoMock, getMuxVideoMock]}>
        <AddByFile onChange={jest.fn()} />
      </MockedProvider>
    )
    await dropTestVideo()
    await waitFor(() =>
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    )
    expect(screen.getByTestId('Upload1Icon')).toBeInTheDocument()
  })

  it('should show error state on fileRejections', async () => {
    render(
      <MockedProvider mocks={[createMuxVideoMock]}>
        <AddByFile onChange={jest.fn()} />
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
