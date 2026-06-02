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
  props: { error?: string } = {}
): { onChange: ReturnType<typeof vi.fn> } {
  const onChange = vi.fn()
  render(
    <MediaSection
      media={media}
      error={props.error}
      onChange={onChange}
      onBlur={vi.fn()}
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

  it('emits a link value as the user types a URL', () => {
    const { onChange } = renderSection({ type: 'none' })
    fireEvent.change(screen.getByLabelText('Media link'), {
      target: { value: 'https://canva.com/x' }
    })
    expect(onChange).toHaveBeenCalledWith({
      type: 'link',
      url: 'https://canva.com/x'
    })
  })

  it('clears the value when switching media type (R12)', () => {
    const { onChange } = renderSection({
      type: 'link',
      url: 'https://canva.com/x'
    })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
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

  it('preserves the existing playbackId when a replacement upload starts', () => {
    const { onChange } = renderSection({
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
  })

  it('reverts to the prior saved video when a replacement upload is cancelled', () => {
    const { onChange } = renderSection({
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
  })

  it('clears to none when cancelling a fresh upload with no prior video', () => {
    const { onChange } = renderSection({ type: 'mux', muxVideoId: '' })
    fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
  })

  it('sets the new video id and playbackId on upload completion', () => {
    const { onChange } = renderSection({ type: 'mux', muxVideoId: '' })
    fireEvent.click(screen.getByRole('button', { name: 'stub-complete' }))
    expect(onChange).toHaveBeenCalledWith({
      type: 'mux',
      muxVideoId: 'vid-new',
      muxPlaybackId: 'pb-new'
    })
  })
})
