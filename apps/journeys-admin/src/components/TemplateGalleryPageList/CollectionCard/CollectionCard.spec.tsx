import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'

import { CollectionCard } from './CollectionCard'

function makeCollection(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'My Collection',
    description: '',
    slug: 'my-collection',
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: [],
    ...overrides
  }
}

const journeyRef = (id: string): TemplateGalleryPage['templates'][number] => ({
  __typename: 'TemplateGalleryItem',
  id,
  title: id,
  primaryImageBlock: null
})

describe('CollectionCard', () => {
  it('shows a Draft chip and an Empty chip when the collection has no templates', () => {
    render(<CollectionCard collection={makeCollection()} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })

  it('shows a Live chip when the collection is published', () => {
    render(
      <CollectionCard
        collection={makeCollection({
          status: TemplateGalleryPageStatus.published,
          publishedAt: '2026-05-06T00:00:00Z',
          templates: [journeyRef('j1')]
        })}
      />
    )
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('renders Publish (not Edit) / Preview / Remove menu items for a draft with templates', async () => {
    render(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    // Drafts surface "Publish" as the single entry point into the
    // dialog; Edit only shows up on published collections.
    expect(
      screen.queryByRole('menuitem', { name: 'Edit' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Publish' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Unpublish' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Remove Collection' })
    ).toBeInTheDocument()
  })

  it('keeps the Publish menu item enabled for an empty draft so the user can still open the dialog', async () => {
    // The dialog's own Publish button is what gates emptiness — the
    // menu item is the user's only way to access metadata, so it
    // stays clickable even before any templates have been added.
    render(<CollectionCard collection={makeCollection()} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(
      screen.getByRole('menuitem', { name: 'Publish' })
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('replaces Publish with Edit for a published collection (Unpublish now lives inside the dialog)', async () => {
    render(
      <CollectionCard
        collection={makeCollection({
          status: TemplateGalleryPageStatus.published,
          publishedAt: '2026-05-06T00:00:00Z',
          templates: [journeyRef('j1')]
        })}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(
      screen.queryByRole('menuitem', { name: 'Publish' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    // Unpublish was promoted into CollectionDialog's footer so the card
    // menu has a single state-aware entry point.
    expect(
      screen.queryByRole('menuitem', { name: 'Unpublish' })
    ).not.toBeInTheDocument()
  })

  it('fires onPublish on a draft and onEdit on a published collection', async () => {
    const onEdit = jest.fn()
    const onPublish = jest.fn()
    const draft = makeCollection({ templates: [journeyRef('j1')] })

    const { rerender } = render(
      <CollectionCard
        collection={draft}
        onEdit={onEdit}
        onPublish={onPublish}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Publish' }))
    expect(onPublish).toHaveBeenCalledWith(draft)
    expect(onEdit).not.toHaveBeenCalled()

    const published = makeCollection({
      templates: [journeyRef('j1')],
      status: TemplateGalleryPageStatus.published,
      publishedAt: '2026-05-06T00:00:00Z'
    })
    rerender(<CollectionCard collection={published} onEdit={onEdit} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith(published)
  })

  it('opens the ungroup confirmation dialog from the menu and fires onUngroup on confirm', async () => {
    const onUngroup = jest.fn()
    const collection = makeCollection({ templates: [journeyRef('j1')] })
    render(<CollectionCard collection={collection} onUngroup={onUngroup} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Remove Collection' })
    )
    const dialog = screen.getByTestId('CollectionUngroupDialog')
    expect(
      within(dialog).getByText('Remove this collection?')
    ).toBeInTheDocument()
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Remove' })
    )
    expect(onUngroup).toHaveBeenCalledWith(collection)
  })

  it('passes wasPublished into the ungroup dialog when publishedAt is set', async () => {
    const collection = makeCollection({
      templates: [journeyRef('j1')],
      status: TemplateGalleryPageStatus.draft,
      publishedAt: '2026-05-06T00:00:00Z'
    })
    render(<CollectionCard collection={collection} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Remove Collection' })
    )
    expect(
      screen.getByText('Any public URL for this collection will return 404.')
    ).toBeInTheDocument()
  })

  it('disables the actions menu trigger when busy is true', () => {
    render(<CollectionCard collection={makeCollection()} busy />)
    expect(
      screen.getByRole('button', { name: 'Collection actions' })
    ).toBeDisabled()
  })

  it('renders a Preview menu item that opens the proxy URL in a new tab when published', async () => {
    const originalOpen = window.open
    window.open = jest.fn() as unknown as typeof window.open
    try {
      render(
        <CollectionCard
          collection={makeCollection({
            slug: 'my-collection',
            status: TemplateGalleryPageStatus.published,
            publishedAt: '2026-05-06T00:00:00Z',
            templates: [journeyRef('j1')]
          })}
        />
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Collection actions' })
      )
      const item = screen.getByRole('menuitem', { name: 'Preview' })
      expect(item).not.toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(item)
      expect(window.open).toHaveBeenCalledWith(
        '/api/preview-template-gallery?slug=my-collection',
        '_blank',
        'noopener,noreferrer'
      )
    } finally {
      window.open = originalOpen
    }
  })

  it('disables Preview when the collection is unpublished', async () => {
    render(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(screen.getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('disables Publish + Preview with the custom-domain reason when canPublish is false', async () => {
    const reason = 'gate copy'
    render(
      <CollectionCard
        collection={makeCollection({
          slug: 'my-collection',
          status: TemplateGalleryPageStatus.published,
          publishedAt: '2026-05-06T00:00:00Z',
          templates: [journeyRef('j1')]
        })}
        canPublish={false}
        publishBlockedReason={reason}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    // Published collections show Unpublish + Preview (no Publish item).
    const previewItem = screen.getByRole('menuitem', { name: 'Preview' })
    expect(previewItem).toHaveAttribute('aria-disabled', 'true')
    // MUI wraps disabled menu items in a <span> so the Tooltip can listen for
    // hover (the disabled <li> itself has pointer-events: none).
    await userEvent.hover(previewItem.parentElement as HTMLElement)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(reason)
  })

  it('disables Publish (and shows the gate reason) when canPublish is false on a draft', async () => {
    const reason = 'gate copy'
    render(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
        canPublish={false}
        publishBlockedReason={reason}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    const publishItem = screen.getByRole('menuitem', { name: 'Publish' })
    expect(publishItem).toHaveAttribute('aria-disabled', 'true')
    // MUI wraps disabled menu items in a <span> so the Tooltip can listen for
    // hover (the disabled <li> itself has pointer-events: none).
    await userEvent.hover(publishItem.parentElement as HTMLElement)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(reason)
  })

  it('renders empty-state caption when there are no templates and children otherwise', () => {
    const { rerender } = render(
      <CollectionCard collection={makeCollection()}>
        <div data-testid="children-payload" />
      </CollectionCard>
    )
    expect(
      screen.getByText('Drag templates here to add them to this collection.')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('children-payload')).not.toBeInTheDocument()

    rerender(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
      >
        <div data-testid="children-payload" />
      </CollectionCard>
    )
    expect(
      screen.queryByText('Drag templates here to add them to this collection.')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('children-payload')).toBeInTheDocument()
  })
})
