import { fireEvent, render, screen } from '@testing-library/react'

import '../../../../../test/i18n'

import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

import { MediaSection } from './MediaSection'

vi.mock('./MuxUploadField', () => ({
  MuxUploadField: () => <div data-testid="MuxUploadFieldStub" />
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
  it('offers Video upload, Canva and YouTube — but not Google Slides', () => {
    renderSection({ type: 'none' })
    expect(
      screen.getByRole('button', { name: 'Video upload' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Canva' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'YouTube' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /slides/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Media type' })
    ).toBeInTheDocument()
  })

  it('defaults a new (none) collection to the Canva URL input', () => {
    renderSection({ type: 'none' })
    expect(screen.getByLabelText('Canva link')).toBeInTheDocument()
  })

  it('emits a link value as the user types a Canva URL', () => {
    const { onChange } = renderSection({ type: 'none' })
    fireEvent.change(screen.getByLabelText('Canva link'), {
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
    fireEvent.click(screen.getByRole('button', { name: 'YouTube' }))
    expect(onChange).toHaveBeenCalledWith({ type: 'none' })
  })

  it('opens the YouTube tab for a saved YouTube link', () => {
    renderSection({
      type: 'link',
      url: 'https://www.youtube-nocookie.com/embed/abc'
    })
    expect(screen.getByRole('button', { name: 'YouTube' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByLabelText('YouTube link')).toHaveValue(
      'https://www.youtube-nocookie.com/embed/abc'
    )
  })

  it('opens the Canva tab for a saved Canva link', () => {
    renderSection({
      type: 'link',
      url: 'https://www.canva.com/design/DA/view'
    })
    expect(screen.getByRole('button', { name: 'Canva' })).toHaveAttribute(
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

  it('renders the upload field in Video upload mode', () => {
    renderSection({ type: 'mux', muxVideoId: 'v1' })
    expect(screen.getByTestId('MuxUploadFieldStub')).toBeInTheDocument()
  })
})
