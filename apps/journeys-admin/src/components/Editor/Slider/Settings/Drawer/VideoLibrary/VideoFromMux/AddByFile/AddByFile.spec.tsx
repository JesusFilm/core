import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  BackgroundUploadProvider,
  useBackgroundUpload
} from '../../../../../../BackgroundUpload'

import { AddByFile } from '.'

jest.mock('../../../../../../BackgroundUpload/BackgroundUploadContext', () => ({
  useBackgroundUpload: jest.fn().mockImplementation(() => ({
    uploadMuxVideo: jest.fn(),
    uploadQueue: {}
  }))
}))

describe('AddByFile', () => {
  it('should start uploading on a file drop', async () => {
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
      expect(useBackgroundUpload().uploadMuxVideo).toHaveBeenCalled()
    )
  })

  it('should show error state on fileRejections', async () => {
    render(
      <BackgroundUploadProvider>
        <AddByFile onChange={jest.fn()} />
      </BackgroundUploadProvider>
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
