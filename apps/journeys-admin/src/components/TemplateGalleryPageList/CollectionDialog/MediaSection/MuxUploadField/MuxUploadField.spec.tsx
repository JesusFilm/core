import { fireEvent, render, screen } from '@testing-library/react'

import '../../../../../../test/i18n'

import { TemplateGalleryPageMediaType } from '../../../../../../__generated__/globalTypes'
import {
  CollectionMediaValues,
  EMPTY_MEDIA
} from '../../useCollectionForm/collectionMedia'

import { MuxUploadField } from './MuxUploadField'

function muxMedia(
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues {
  return { ...EMPTY_MEDIA, type: TemplateGalleryPageMediaType.mux, ...overrides }
}

const mockGetUploadStatus = vi.fn()
const mockAddUploadTask = vi.fn()
const mockCancelUploadForBlock = vi.fn()
const mockReadQuery = vi.fn()

vi.mock('../../../../MuxVideoUploadProvider', () => ({
  GET_MY_MUX_VIDEO_QUERY: 'GET_MY_MUX_VIDEO_QUERY',
  useMuxVideoUpload: () => ({
    getUploadStatus: mockGetUploadStatus,
    addUploadTask: mockAddUploadTask,
    cancelUploadForBlock: mockCancelUploadForBlock
  })
}))

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client')
  return { ...actual, useApolloClient: () => ({ readQuery: mockReadQuery }) }
})

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
      media={muxMedia()}
      hasVideo={false}
      onUploadStart={onUploadStart}
      onComplete={onComplete}
      onCancel={onCancel}
      onRemove={onRemove}
      {...props}
    />
  )
  return { onUploadStart, onComplete, onCancel, onRemove }
}

function renderFieldWithRerender(): {
  rerender: (props: React.ComponentProps<typeof MuxUploadField>) => void
  props: React.ComponentProps<typeof MuxUploadField>
} {
  const props: React.ComponentProps<typeof MuxUploadField> = {
    uploadKey: 'key-1',
    media: muxMedia(),
    hasVideo: false,
    onUploadStart: vi.fn(),
    onComplete: vi.fn(),
    onCancel: vi.fn(),
    onRemove: vi.fn()
  }
  const { rerender } = render(<MuxUploadField {...props} />)
  return {
    rerender: (next) => rerender(<MuxUploadField {...next} />),
    props
  }
}

describe('MuxUploadField', () => {
  beforeEach(() => {
    mockGetUploadStatus.mockReset().mockReturnValue(null)
    mockAddUploadTask.mockReset()
    mockCancelUploadForBlock.mockReset()
    mockReadQuery.mockReset().mockReturnValue(null)
  })

  function pickFile(): void {
    fireEvent.change(screen.getByTestId('MuxUploadFieldInput'), {
      target: { files: [new File(['x'], 'clip.mp4', { type: 'video/mp4' })] }
    })
  }

  it('aborts a prior upload then starts a new one when a file is chosen', () => {
    const { onUploadStart } = renderField()
    pickFile()
    // Re-pick aborts any prior in-flight upload for this key first.
    expect(mockCancelUploadForBlock).toHaveBeenCalledWith({ id: 'key-1' })
    expect(onUploadStart).toHaveBeenCalledTimes(1)
    expect(mockAddUploadTask).toHaveBeenCalledWith(
      'key-1',
      expect.any(File),
      undefined,
      undefined,
      expect.any(Function)
    )
  })

  it('passes the videoId, cached playbackId, name and duration to onComplete', () => {
    mockReadQuery.mockReturnValue({
      getMyMuxVideo: { playbackId: 'pb-x', name: 'My clip', duration: 125 }
    })
    const { onComplete } = renderField()
    pickFile()
    // The provider invokes the completion callback (5th arg to addUploadTask).
    const completeCb = mockAddUploadTask.mock.calls[0][4] as (
      videoId: string
    ) => void
    completeCb('vid-1')
    expect(onComplete).toHaveBeenCalledWith('vid-1', 'pb-x', 'My clip', 125)
  })

  it('passes null playbackId/name/duration when the cache has none', () => {
    mockReadQuery.mockReturnValue(null)
    const { onComplete } = renderField()
    pickFile()
    const completeCb = mockAddUploadTask.mock.calls[0][4] as (
      videoId: string
    ) => void
    completeCb('vid-1')
    expect(onComplete).toHaveBeenCalledWith('vid-1', null, null, null)
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

  it('offers an enabled Remove escape hatch in the errored state', () => {
    // Without this, an errored fresh upload leaves the form stuck on an
    // incomplete mux value that blocks Save indefinitely.
    mockGetUploadStatus.mockReturnValue({ status: 'error', progress: 0 })
    const { onRemove } = renderField()
    const remove = screen.getByRole('button', { name: 'Remove' })
    expect(remove).toBeEnabled()
    fireEvent.click(remove)
    expect(mockCancelUploadForBlock).toHaveBeenCalled()
    // Remove clears to none (label-accurate even for a failed replacement).
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('keeps the error UI after the provider cleans up the errored task', () => {
    // The provider deletes errored tasks ~1s after failure; the latched
    // local flag must keep the error (and its escape hatch) visible.
    mockGetUploadStatus.mockReturnValue({ status: 'error', progress: 0 })
    const { rerender, props } = renderFieldWithRerender()
    expect(screen.getByTestId('MuxUploadFieldError')).toBeInTheDocument()
    // Task cleaned up: provider now reports no task at all.
    mockGetUploadStatus.mockReturnValue(null)
    rerender(props)
    expect(screen.getByTestId('MuxUploadFieldError')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeEnabled()
  })

  it('frames the empty box as "Choose a video"', () => {
    renderField()
    expect(
      screen.getByRole('button', { name: 'Choose a video' })
    ).toBeInTheDocument()
  })

  it('renders Remove disabled when no video is attached (no layout shift)', () => {
    renderField()
    expect(screen.getByTestId('MuxUploadFieldEmpty')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
  })

  it('shows the attached state — thumbnail in the box, name + duration + Remove', () => {
    const { onRemove } = renderField({
      hasVideo: true,
      media: muxMedia({
        muxPlaybackId: 'pb-1',
        muxName: 'My clip',
        muxDuration: 125
      })
    })
    expect(screen.getByTestId('MuxUploadFieldReady')).toBeInTheDocument()
    expect(screen.getByText('My clip')).toBeInTheDocument()
    // 125s → 2:05.
    expect(screen.getByText('2:05')).toBeInTheDocument()
    // The thumbnail renders in the box; the box doubles as Replace.
    expect(screen.getByTestId('GalleryMediaPreviewThumbnail')).toHaveAttribute(
      'src',
      'https://image.mux.com/pb-1/thumbnail.jpg'
    )
    expect(
      screen.getByRole('button', { name: 'Replace video' })
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('falls back to "Video attached" when the video has no name', () => {
    renderField({
      hasVideo: true,
      media: muxMedia({ muxPlaybackId: 'pb-1' })
    })
    expect(screen.getByText('Video attached')).toBeInTheDocument()
  })
})
