import { fireEvent, render, screen } from '@testing-library/react'

import '../../../../../test/i18n'

import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

import { MediaSection } from './MediaSection'

vi.mock('./MuxUploadField', () => ({
  MuxUploadField: (props: {
    onUploadStart: () => void
    onComplete: (videoId: string, playbackId: string | null) => void
    onCancel: () => void
    onRemove: () => void
  }) => (
    <div data-testid="MuxUploadFieldStub">
      <button onClick={() => props.onUploadStart()}>stub-start</button>
      <button onClick={() => props.onComplete('vid-new', 'pb-new')}>
        stub-complete
      </button>
      <button onClick={() => props.onCancel()}>stub-cancel</button>
      <button onClick={() => props.onRemove()}>stub-remove</button>
    </div>
  )
}))

function renderSection(
  media: CollectionMediaValues,
  props: { error?: string; saving?: boolean; disableModeSwitch?: boolean } = {}
): {
  onChange: ReturnType<typeof vi.fn>
  onCommit: ReturnType<typeof vi.fn>
} {
  const onChange = vi.fn()
  const onCommit = vi.fn()
  render(
    <MediaSection
      media={media}
      uploadKey="upload-key-1"
      error={props.error}
      saving={props.saving}
      disableModeSwitch={props.disableModeSwitch}
      onChange={onChange}
      onCommit={onCommit}
      headerSx={{}}
    />
  )
  return { onChange, onCommit }
}

describe('MediaSection', () => {
  it('offers just Upload and Link (no per-provider tabs)', () => {
    renderSection({ type: 'none' })
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /canva|youtube|slides/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Media type' })
    ).toBeInTheDocument()
  })

  it('defaults a new (none) collection to the Link input', () => {
    renderSection({ type: 'none' })
    expect(screen.getByLabelText('Media link')).toBeInTheDocument()
  })

  it('emits a transient link value as the user types a URL (no commit yet)', () => {
    const { onChange, onCommit } = renderSection({ type: 'none' })
    fireEvent.change(screen.getByLabelText('Media link'), {
      target: { value: 'https://canva.com/x' }
    })
    expect(onChange).toHaveBeenCalledWith({
      type: 'link',
      url: 'https://canva.com/x'
    })
    // Typing must not persist — that only happens on blur.
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('commits the link on blur', () => {
    const { onCommit } = renderSection({
      type: 'link',
      url: 'https://canva.com/x'
    })
    fireEvent.blur(screen.getByLabelText('Media link'), {
      target: { value: 'https://canva.com/x' }
    })
    expect(onCommit).toHaveBeenCalledWith({
      type: 'link',
      url: 'https://canva.com/x'
    })
  })

  it('commits none when the link is cleared and blurred', () => {
    const { onCommit } = renderSection({ type: 'link', url: 'https://x.test/a' })
    fireEvent.blur(screen.getByLabelText('Media link'), {
      target: { value: '   ' }
    })
    expect(onCommit).toHaveBeenCalledWith({ type: 'none' })
  })

  it('does NOT clear saved media when switching tabs', () => {
    const { onChange, onCommit } = renderSection({
      type: 'link',
      url: 'https://canva.com/x'
    })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    // Switching only changes the visible input — no value change/persist.
    expect(onChange).not.toHaveBeenCalled()
    expect(onCommit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Upload' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('opens the Link tab for any saved link', () => {
    renderSection({
      type: 'link',
      url: 'https://www.youtube-nocookie.com/embed/abc'
    })
    expect(screen.getByRole('button', { name: 'Link' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByLabelText('Media link')).toHaveValue(
      'https://www.youtube-nocookie.com/embed/abc'
    )
  })

  it('opens the Upload tab for a saved mux row', () => {
    renderSection({ type: 'mux', muxVideoId: '', muxPlaybackId: 'pb-1' })
    expect(screen.getByRole('button', { name: 'Upload' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('surfaces a media error as helper text', () => {
    renderSection(
      { type: 'link', url: 'https://youtu.be/p' },
      { error: 'This YouTube video is private.' }
    )
    expect(
      screen.getByText('This YouTube video is private.')
    ).toBeInTheDocument()
  })

  it('renders the upload field in Upload mode', () => {
    renderSection({ type: 'mux', muxVideoId: 'v1' })
    expect(screen.getByTestId('MuxUploadFieldStub')).toBeInTheDocument()
  })

  it('preserves the existing playbackId (transiently) when a replacement upload starts', () => {
    const { onChange, onCommit } = renderSection({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-9'
    })
    fireEvent.click(screen.getByRole('button', { name: 'stub-start' }))
    expect(onChange).toHaveBeenCalledWith({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-9'
    })
    // An in-flight upload isn't persisted until it completes.
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('reverts (transiently) to the prior saved video when a replacement upload is cancelled', () => {
    const { onChange, onCommit } = renderSection({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-9'
    })
    fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
    expect(onChange).toHaveBeenCalledWith({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-9'
    })
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('clears to none (transiently) when cancelling a fresh upload with no prior video', () => {
    const { onChange } = renderSection({ type: 'mux', muxVideoId: '' })
    fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
  })

  it('commits the new video id and playbackId on upload completion', () => {
    const { onCommit } = renderSection({ type: 'mux', muxVideoId: '' })
    fireEvent.click(screen.getByRole('button', { name: 'stub-complete' }))
    expect(onCommit).toHaveBeenCalledWith({
      type: 'mux',
      muxVideoId: 'vid-new',
      muxPlaybackId: 'pb-new'
    })
  })

  it('commits none on Remove', () => {
    const { onCommit } = renderSection({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-1'
    })
    fireEvent.click(screen.getByRole('button', { name: 'stub-remove' }))
    expect(onCommit).toHaveBeenCalledWith({ type: 'none' })
  })

  it('shows a saving indicator and disables the link field while persisting', () => {
    renderSection({ type: 'link', url: 'https://x.test/a' }, { saving: true })
    expect(screen.getByText('Saving…')).toBeInTheDocument()
    expect(screen.getByLabelText('Media link')).toBeDisabled()
  })

  it('locks the Link/Upload toggle while an upload is in flight', () => {
    renderSection({ type: 'mux', muxVideoId: '' }, { disableModeSwitch: true })
    expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
  })
})
