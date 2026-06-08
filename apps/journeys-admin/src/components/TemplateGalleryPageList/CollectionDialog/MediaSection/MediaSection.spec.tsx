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
} {
  const onChange = vi.fn()
  render(
    <MediaSection
      media={media}
      uploadKey="upload-key-1"
      error={props.error}
      saving={props.saving}
      disableModeSwitch={props.disableModeSwitch}
      onChange={onChange}
      headerSx={{}}
    />
  )
  return { onChange }
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

  it('emits the link value as the user types a URL', () => {
    const { onChange } = renderSection({ type: 'none' })
    fireEvent.change(screen.getByLabelText('Media link'), {
      target: { value: 'https://canva.com/x' }
    })
    expect(onChange).toHaveBeenCalledWith({
      type: 'link',
      url: 'https://canva.com/x'
    })
  })

  it('does nothing on blur — links save with the dialog Save', () => {
    const { onChange } = renderSection({
      type: 'link',
      url: 'https://canva.com/x'
    })
    fireEvent.blur(screen.getByLabelText('Media link'), {
      target: { value: 'https://canva.com/x' }
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears the link when Remove is clicked (form state, saved by dialog Save)', () => {
    const { onChange } = renderSection({
      type: 'link',
      url: 'https://x.test/a'
    })
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
  })

  it('renders Remove disabled when there is no link (no layout shift)', () => {
    renderSection({ type: 'none' })
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
  })

  it('does NOT clear saved media when switching tabs', () => {
    const { onChange } = renderSection({
      type: 'link',
      url: 'https://canva.com/x'
    })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    // Switching only changes the visible input — no value change.
    expect(onChange).not.toHaveBeenCalled()
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

  it('leaves the committed video untouched when a replacement upload starts', () => {
    // Overwriting the committed value with an empty placeholder would lose
    // the muxVideoId — unrecoverable in create mode (no server row). The
    // in-flight provider task is what gates Save during the replacement.
    const { onChange } = renderSection({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-9'
    })
    fireEvent.click(screen.getByRole('button', { name: 'stub-start' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the committed video when a replacement upload is cancelled', () => {
    const { onChange } = renderSection({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-9'
    })
    fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
    // Nothing was overwritten at start, so there is nothing to revert.
    expect(onChange).not.toHaveBeenCalled()
  })

  it('writes the incomplete placeholder when a fresh upload starts', () => {
    const { onChange } = renderSection({ type: 'none' })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    fireEvent.click(screen.getByRole('button', { name: 'stub-start' }))
    expect(onChange).toHaveBeenCalledWith({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: null
    })
  })

  it('clears to none when cancelling a fresh upload with no prior video', () => {
    const { onChange } = renderSection({ type: 'mux', muxVideoId: '' })
    fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
  })

  it('updates the form with the new video id and playbackId on upload completion', () => {
    const { onChange } = renderSection({ type: 'mux', muxVideoId: '' })
    fireEvent.click(screen.getByRole('button', { name: 'stub-complete' }))
    expect(onChange).toHaveBeenCalledWith({
      type: 'mux',
      muxVideoId: 'vid-new',
      muxPlaybackId: 'pb-new'
    })
  })

  it('clears to none on Remove (form state, saved by dialog Save)', () => {
    const { onChange } = renderSection({
      type: 'mux',
      muxVideoId: '',
      muxPlaybackId: 'pb-1'
    })
    fireEvent.click(screen.getByRole('button', { name: 'stub-remove' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
  })

  it('disables the link field while the dialog is saving', () => {
    renderSection({ type: 'link', url: 'https://x.test/a' }, { saving: true })
    expect(screen.getByLabelText('Media link')).toBeDisabled()
  })

  it('locks the Link/Upload toggle while an upload is in flight', () => {
    renderSection({ type: 'mux', muxVideoId: '' }, { disableModeSwitch: true })
    expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
  })

  it('shows a grey placeholder box on the Link tab when there is no media', () => {
    renderSection({ type: 'none' })
    expect(
      screen.getByTestId('GalleryMediaPreviewPlaceholder')
    ).toBeInTheDocument()
  })

  it('blanks the link-tab preview box when the saved media is a video', () => {
    // Saved video, but the Link tab must show a blank box, not the video
    // (boxMedia follows the active tab; the Upload box is its own component).
    renderSection({ type: 'mux', muxVideoId: '', muxPlaybackId: 'pb-1' })
    fireEvent.click(screen.getByRole('button', { name: 'Link' }))
    expect(
      screen.queryByTestId('GalleryMediaPreviewThumbnail')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('GalleryMediaPreviewPlaceholder')
    ).toBeInTheDocument()
  })
})
