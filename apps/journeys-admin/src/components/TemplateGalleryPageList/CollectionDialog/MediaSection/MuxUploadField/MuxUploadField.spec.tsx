import { fireEvent, render, screen } from '@testing-library/react'

import '../../../../../../test/i18n'

import { MuxUploadField } from './MuxUploadField'

const mockGetUploadStatus = vi.fn()
const mockAddUploadTask = vi.fn()
const mockCancelUploadForBlock = vi.fn()

vi.mock('../../../../MuxVideoUploadProvider', () => ({
  useMuxVideoUpload: () => ({
    getUploadStatus: mockGetUploadStatus,
    addUploadTask: mockAddUploadTask,
    cancelUploadForBlock: mockCancelUploadForBlock
  })
}))

function renderField(
  props: Partial<React.ComponentProps<typeof MuxUploadField>> = {}
): {
  onUploadStart: ReturnType<typeof vi.fn>
  onComplete: ReturnType<typeof vi.fn>
  onCancel: ReturnType<typeof vi.fn>
  onRemove: ReturnType<typeof vi.fn>
} {
  const onUploadStart = vi.fn()
  const onComplete = vi.fn()
  const onCancel = vi.fn()
  const onRemove = vi.fn()
  render(
    <MuxUploadField
      uploadKey="key-1"
      hasVideo={false}
      playbackId={null}
      onUploadStart={onUploadStart}
      onComplete={onComplete}
      onCancel={onCancel}
      onRemove={onRemove}
      {...props}
    />
  )
  return { onUploadStart, onComplete, onCancel, onRemove }
}

describe('MuxUploadField', () => {
  beforeEach(() => {
    mockGetUploadStatus.mockReset().mockReturnValue(null)
    mockAddUploadTask.mockReset()
    mockCancelUploadForBlock.mockReset()
  })

  it('aborts a prior upload then starts a new one when a file is chosen', () => {
    const { onUploadStart, onComplete } = renderField()
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' })
    fireEvent.change(screen.getByTestId('MuxUploadFieldInput'), {
      target: { files: [file] }
    })
    // Re-pick aborts any prior in-flight upload for this key first.
    expect(mockCancelUploadForBlock).toHaveBeenCalledWith({ id: 'key-1' })
    expect(onUploadStart).toHaveBeenCalledTimes(1)
    expect(mockAddUploadTask).toHaveBeenCalledWith(
      'key-1',
      file,
      undefined,
      undefined,
      onComplete
    )
  })

  it('shows progress and cancels an in-flight upload (reverting, not removing)', () => {
    mockGetUploadStatus.mockReturnValue({ status: 'uploading', progress: 42 })
    const { onCancel, onRemove } = renderField()
    expect(screen.getByTestId('MuxUploadFieldUploading')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockCancelUploadForBlock).toHaveBeenCalledWith({ id: 'key-1' })
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('shows the processing state', () => {
    mockGetUploadStatus.mockReturnValue({ status: 'processing', progress: 100 })
    renderField()
    expect(screen.getByTestId('MuxUploadFieldProcessing')).toBeInTheDocument()
  })

  it('shows an error with a retry control', () => {
    mockGetUploadStatus.mockReturnValue({ status: 'error', progress: 0 })
    renderField()
    expect(screen.getByTestId('MuxUploadFieldError')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try again' })
    ).toBeInTheDocument()
  })

  it('shows the attached state with a thumbnail and removes on request', () => {
    const { onRemove } = renderField({ hasVideo: true, playbackId: 'pb-1' })
    expect(screen.getByTestId('MuxUploadFieldReady')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://image.mux.com/pb-1/thumbnail.jpg'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
