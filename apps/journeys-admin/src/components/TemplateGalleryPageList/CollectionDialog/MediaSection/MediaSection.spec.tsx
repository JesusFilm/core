import { fireEvent, render, screen } from '@testing-library/react'

import '../../../../../test/i18n'

import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'
import {
  CollectionMediaValues,
  EMPTY_MEDIA
} from '../useCollectionForm/collectionMedia'

import { MediaSection } from './MediaSection'

vi.mock('./MuxUploadField', () => ({
  MuxUploadField: (props: {
    onUploadStart: () => void
    onComplete: (
      videoId: string,
      playbackId: string | null,
      muxName: string | null,
      muxDuration: number | null
    ) => void
    onCancel: () => void
    onRemove: () => void
  }) => (
    <div data-testid="MuxUploadFieldStub">
      <button onClick={() => props.onUploadStart()}>stub-start</button>
      <button onClick={() => props.onComplete('vid-new', 'pb-new', 'Clip', 12)}>
        stub-complete
      </button>
      <button onClick={() => props.onCancel()}>stub-cancel</button>
      <button onClick={() => props.onRemove()}>stub-remove</button>
    </div>
  )
}))

// MediaPreview renders the server-resolved embed via an Apollo query; stub it
// so MediaSection's toggle/onChange tests don't need a GraphQL provider. Keep
// the box-size constants the section imports from the same module.
vi.mock('../MediaPreview', async () => ({
  ...(await vi.importActual('../MediaPreview')),
  MediaPreview: ({ media }: { media: CollectionMediaValues }) => (
    <div data-testid="MediaPreviewStub" data-media-type={media.type} />
  )
}))

function media(
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues {
  return { ...EMPTY_MEDIA, ...overrides }
}
const linkMedia = (url: string): CollectionMediaValues =>
  media({ type: TemplateGalleryPageMediaType.link, url })
const muxMedia = (
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues =>
  media({ type: TemplateGalleryPageMediaType.mux, ...overrides })

function renderSection(
  value: CollectionMediaValues,
  props: { error?: string; saving?: boolean; disableModeSwitch?: boolean } = {}
): { onChange: ReturnType<typeof vi.fn> } {
  const onChange = vi.fn()
  render(
    <MediaSection
      media={value}
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
  it('offers a 3-way Link / Upload / None toggle', () => {
    renderSection(media())
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Media type' })
    ).toBeInTheDocument()
  })

  it('shows the None empty-state (no inputs) when type is none', () => {
    renderSection(media())
    expect(screen.getByTestId('MediaSectionNone')).toBeInTheDocument()
    expect(screen.queryByLabelText('Media link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('MuxUploadFieldStub')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'None' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  describe('type toggle (only sets type; retains both slots)', () => {
    it('selecting Link sets type only, keeping the parked upload', () => {
      const { onChange } = renderSection(
        muxMedia({ muxVideoId: 'v9', muxPlaybackId: 'pb-9' })
      )
      fireEvent.click(screen.getByRole('button', { name: 'Link' }))
      expect(onChange).toHaveBeenCalledWith({
        ...muxMedia({ muxVideoId: 'v9', muxPlaybackId: 'pb-9' }),
        type: TemplateGalleryPageMediaType.link
      })
    })

    it('selecting Upload sets type only, keeping the parked link', () => {
      const { onChange } = renderSection(linkMedia('https://x.test/a'))
      fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
      expect(onChange).toHaveBeenCalledWith({
        ...linkMedia('https://x.test/a'),
        type: TemplateGalleryPageMediaType.mux
      })
    })

    it('selecting None sets type only, keeping both parked slots', () => {
      // Both slots populated, so the assertion actually proves the parked
      // upload (muxVideoId/playbackId) AND link survive the None toggle.
      const both = media({
        type: TemplateGalleryPageMediaType.link,
        url: 'https://x.test/a',
        muxVideoId: 'v9',
        muxPlaybackId: 'pb-9'
      })
      const { onChange } = renderSection(both)
      fireEvent.click(screen.getByRole('button', { name: 'None' }))
      expect(onChange).toHaveBeenCalledWith({
        ...both,
        type: TemplateGalleryPageMediaType.none
      })
    })

    it('re-clicking the active type is a no-op', () => {
      const { onChange } = renderSection(linkMedia('https://x.test/a'))
      fireEvent.click(screen.getByRole('button', { name: 'Link' }))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('link slot', () => {
    it('emits only url as the user types (type + mux slot unchanged)', () => {
      const { onChange } = renderSection(
        media({ type: TemplateGalleryPageMediaType.link, muxVideoId: 'v9' })
      )
      fireEvent.change(screen.getByLabelText('Media link'), {
        target: { value: 'https://canva.com/x' }
      })
      expect(onChange).toHaveBeenCalledWith({
        ...media({ type: TemplateGalleryPageMediaType.link, muxVideoId: 'v9' }),
        url: 'https://canva.com/x'
      })
    })

    it('clears only url on Remove (type stays link)', () => {
      const { onChange } = renderSection(linkMedia('https://x.test/a'))
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
      expect(onChange).toHaveBeenCalledWith({
        ...linkMedia('https://x.test/a'),
        url: ''
      })
    })

    it('disables Remove when the link is empty', () => {
      renderSection(media({ type: TemplateGalleryPageMediaType.link }))
      expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
    })

    it('does nothing on blur — links save with the dialog Save', () => {
      const { onChange } = renderSection(linkMedia('https://canva.com/x'))
      fireEvent.blur(screen.getByLabelText('Media link'), {
        target: { value: 'https://canva.com/x' }
      })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('surfaces a media error as helper text', () => {
      renderSection(linkMedia('https://youtu.be/p'), {
        error: 'This YouTube video is private.'
      })
      expect(
        screen.getByText('This YouTube video is private.')
      ).toBeInTheDocument()
    })

    it('disables the link field while the dialog is saving', () => {
      renderSection(linkMedia('https://x.test/a'), { saving: true })
      expect(screen.getByLabelText('Media link')).toBeDisabled()
    })

    it('shows the active link preview, never the parked upload', () => {
      renderSection(
        media({
          type: TemplateGalleryPageMediaType.link,
          muxPlaybackId: 'pb-1'
        })
      )
      // Link tab is active: the preview gets the link-typed media (so it
      // resolves the link), not the parked mux slot.
      expect(screen.getByTestId('MediaPreviewStub')).toHaveAttribute(
        'data-media-type',
        'link'
      )
    })
  })

  describe('upload slot', () => {
    it('renders the upload field for a mux type', () => {
      renderSection(muxMedia({ muxVideoId: 'v1' }))
      expect(screen.getByTestId('MuxUploadFieldStub')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Upload' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })

    it('writes the incomplete placeholder when a fresh upload starts', () => {
      const { onChange } = renderSection(muxMedia())
      fireEvent.click(screen.getByRole('button', { name: 'stub-start' }))
      expect(onChange).toHaveBeenCalledWith({
        ...muxMedia(),
        muxVideoId: '',
        muxPlaybackId: null
      })
    })

    it('leaves a committed video untouched when a replacement upload starts', () => {
      const { onChange } = renderSection(muxMedia({ muxPlaybackId: 'pb-9' }))
      fireEvent.click(screen.getByRole('button', { name: 'stub-start' }))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('updates the mux slot on completion (type stays mux)', () => {
      const { onChange } = renderSection(muxMedia())
      fireEvent.click(screen.getByRole('button', { name: 'stub-complete' }))
      expect(onChange).toHaveBeenCalledWith({
        ...muxMedia(),
        muxVideoId: 'vid-new',
        muxPlaybackId: 'pb-new',
        muxName: 'Clip',
        muxDuration: 12
      })
    })

    it('clears only the mux slot on Remove (type stays mux)', () => {
      const { onChange } = renderSection(muxMedia({ muxPlaybackId: 'pb-1' }))
      fireEvent.click(screen.getByRole('button', { name: 'stub-remove' }))
      expect(onChange).toHaveBeenCalledWith({
        ...muxMedia(),
        muxVideoId: '',
        muxPlaybackId: null,
        muxName: null,
        muxDuration: null
      })
    })

    it('clears the mux slot when cancelling a fresh upload (type stays mux)', () => {
      const { onChange } = renderSection(muxMedia())
      fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
      expect(onChange).toHaveBeenCalledWith({
        ...muxMedia(),
        muxVideoId: '',
        muxPlaybackId: null,
        muxName: null,
        muxDuration: null
      })
    })

    it('does not revert a committed video when cancelling a replacement', () => {
      const { onChange } = renderSection(muxMedia({ muxPlaybackId: 'pb-9' }))
      fireEvent.click(screen.getByRole('button', { name: 'stub-cancel' }))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('locks the whole toggle while an upload is in flight', () => {
    renderSection(muxMedia(), { disableModeSwitch: true })
    expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'None' })).toBeDisabled()
  })
})
