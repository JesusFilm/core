import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import '../../../../../test/i18n'

import { CollectionPreviewPane } from './CollectionPreviewPane'

describe('CollectionPreviewPane', () => {
  let originalOpen: typeof window.open

  beforeEach(() => {
    originalOpen = window.open
    window.open = vi.fn()
  })

  afterEach(() => {
    window.open = originalOpen
  })

  const baseValues = {
    title: 'My Collection',
    description: '',
    creatorName: 'Creator',
    creatorImageSrc: '',
    creatorImageAlt: '',
    mediaUrl: ''
  }

  function renderPane(
    overrides: Partial<React.ComponentProps<typeof CollectionPreviewPane>> = {}
  ): void {
    render(
      <SnackbarProvider>
        <CollectionPreviewPane
          values={baseValues}
          selectedJourneysOrdered={[]}
          publicUrl="https://your.nextstep.is/template-gallery/my-collection"
          slug="my-collection"
          {...overrides}
        />
      </SnackbarProvider>
    )
  }

  it('opens the proxy URL in a new tab when "Open in new tab" is clicked', async () => {
    renderPane()
    await userEvent.click(
      screen.getByRole('button', { name: 'Open in new tab' })
    )
    expect(window.open).toHaveBeenCalledWith(
      '/api/preview-template-gallery?slug=my-collection',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('disables Open when publicUrl is null', () => {
    renderPane({ publicUrl: null, slug: null })
    expect(
      screen.getByRole('button', { name: 'Open in new tab' })
    ).toBeDisabled()
  })

  it('disables Open when canPublish is false', () => {
    renderPane({
      canPublish: false,
      publishBlockedReason: 'gate copy'
    })
    expect(
      screen.getByRole('button', { name: 'Open in new tab' })
    ).toBeDisabled()
  })

  it('disables Open when slug is missing', () => {
    renderPane({
      slug: null,
      publicUrl: 'https://your.nextstep.is/template-gallery/something'
    })
    expect(
      screen.getByRole('button', { name: 'Open in new tab' })
    ).toBeDisabled()
  })
})
