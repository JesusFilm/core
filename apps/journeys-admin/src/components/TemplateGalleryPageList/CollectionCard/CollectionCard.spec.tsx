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
  __typename: 'Journey',
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

  it('shows a Published chip when the collection is published', () => {
    render(
      <CollectionCard
        collection={makeCollection({
          status: TemplateGalleryPageStatus.published,
          publishedAt: '2026-05-06T00:00:00Z',
          templates: [journeyRef('j1')]
        })}
      />
    )
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('renders Edit / Publish / Remove menu items for a draft with templates', async () => {
    render(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
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

  it('disables Publish for an empty draft collection', async () => {
    render(<CollectionCard collection={makeCollection()} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(screen.getByRole('menuitem', { name: 'Publish' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('replaces Publish with Unpublish for a published collection', async () => {
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
    expect(
      screen.getByRole('menuitem', { name: 'Unpublish' })
    ).toBeInTheDocument()
  })

  it('fires onEdit / onPublish / onUnpublish with the collection', async () => {
    const onEdit = jest.fn()
    const onPublish = jest.fn()
    const collection = makeCollection({ templates: [journeyRef('j1')] })

    const { rerender } = render(
      <CollectionCard
        collection={collection}
        onEdit={onEdit}
        onPublish={onPublish}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith(collection)

    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Publish' }))
    expect(onPublish).toHaveBeenCalledWith(collection)

    const onUnpublish = jest.fn()
    const published = makeCollection({
      templates: [journeyRef('j1')],
      status: TemplateGalleryPageStatus.published,
      publishedAt: '2026-05-06T00:00:00Z'
    })
    rerender(
      <CollectionCard collection={published} onUnpublish={onUnpublish} />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Unpublish' }))
    expect(onUnpublish).toHaveBeenCalledWith(published)
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
    expect(screen.getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
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
    expect(screen.getByRole('menuitem', { name: 'Publish' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
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
