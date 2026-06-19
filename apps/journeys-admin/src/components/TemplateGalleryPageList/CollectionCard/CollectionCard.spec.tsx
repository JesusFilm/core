import { fireEvent, render, screen, within } from '@testing-library/react'
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
    media: null,
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

  it('renders Edit / Preview / Remove menu items for a draft with templates', async () => {
    render(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    // Edit is the single entry point into the dialog regardless of
    // status — the dialog's footer is what's contextual (Publish for
    // drafts, Unpublish for published collections).
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Publish' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Unpublish' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Remove Collection' })
    ).toBeInTheDocument()
  })

  it('keeps the Edit menu item enabled for an empty draft so the user can still open the dialog', async () => {
    // The dialog's own Publish button is what gates emptiness — the
    // menu item is the user's only way to access metadata, so it
    // stays clickable even before any templates have been added.
    render(<CollectionCard collection={makeCollection()} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(screen.getByRole('menuitem', { name: 'Edit' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('shows the same Edit entry for a published collection (Unpublish lives inside the dialog)', async () => {
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
    expect(
      screen.queryByRole('menuitem', { name: 'Unpublish' })
    ).not.toBeInTheDocument()
  })

  it('fires onEdit with the collection for drafts and published alike', async () => {
    const onEdit = vi.fn()
    const draft = makeCollection({ templates: [journeyRef('j1')] })

    const { rerender } = render(
      <CollectionCard collection={draft} onEdit={onEdit} />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith(draft)

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
    const onUngroup = vi.fn()
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
    window.open = vi.fn() as unknown as typeof window.open
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

  it('keeps Edit enabled when canPublish is false (the gate lives on the dialog footer)', async () => {
    render(
      <CollectionCard
        collection={makeCollection({ templates: [journeyRef('j1')] })}
        canPublish={false}
        publishBlockedReason="gate copy"
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(screen.getByRole('menuitem', { name: 'Edit' })).not.toHaveAttribute(
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

  describe('collapse (NES-1717)', () => {
    it('renders the header as an expanded toggle button by default', () => {
      render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
        >
          <div data-testid="children-payload" />
        </CollectionCard>
      )
      // Expanded → the announced action is "Collapse".
      const toggle = screen.getByRole('button', {
        name: 'Collapse My Collection collection'
      })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      // Expanded: the grid (children) is visible and there's no count badge.
      expect(screen.getByTestId('children-payload')).toBeInTheDocument()
      expect(
        screen.queryByTestId('CollectionCardCount-page-1')
      ).not.toBeInTheDocument()
    })

    it('hides the grid and shows a template-count badge when collapsed', () => {
      render(
        <CollectionCard
          collection={makeCollection({
            templates: [journeyRef('j1'), journeyRef('j2')]
          })}
          collapsed
        >
          <div data-testid="children-payload" />
        </CollectionCard>
      )
      // Collapsed → the announced action is "Expand".
      const toggle = screen.getByRole('button', {
        name: 'Expand My Collection collection'
      })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      // Collapsed: grid unmounted, count badge reflects the template count.
      expect(screen.queryByTestId('children-payload')).not.toBeInTheDocument()
      expect(
        screen.getByTestId('CollectionCardCount-page-1')
      ).toHaveTextContent('2')
    })

    it('does not show a count badge for an empty collapsed collection', () => {
      render(<CollectionCard collection={makeCollection()} collapsed />)
      expect(
        screen.queryByTestId('CollectionCardCount-page-1')
      ).not.toBeInTheDocument()
      expect(screen.getByText('Empty')).toBeInTheDocument()
    })

    it('fires onToggleCollapse when the header is clicked', async () => {
      const onToggleCollapse = vi.fn()
      const collection = makeCollection({ templates: [journeyRef('j1')] })
      render(
        <CollectionCard
          collection={collection}
          onToggleCollapse={onToggleCollapse}
        />
      )
      await userEvent.click(screen.getByTestId('CollectionCardToggle-page-1'))
      expect(onToggleCollapse).toHaveBeenCalledWith(collection)
    })

    it('toggles on Enter and Space for keyboard users', async () => {
      const onToggleCollapse = vi.fn()
      const collection = makeCollection({ templates: [journeyRef('j1')] })
      render(
        <CollectionCard
          collection={collection}
          onToggleCollapse={onToggleCollapse}
        />
      )
      const toggle = screen.getByTestId('CollectionCardToggle-page-1')
      toggle.focus()
      await userEvent.keyboard('{Enter}')
      await userEvent.keyboard(' ')
      expect(onToggleCollapse).toHaveBeenCalledTimes(2)
      expect(onToggleCollapse).toHaveBeenNthCalledWith(1, collection)
      expect(onToggleCollapse).toHaveBeenNthCalledWith(2, collection)
    })

    it('does not collapse the actions menu trigger into the toggle button', async () => {
      // The actions menu must stay a sibling of the toggle so it opens the
      // menu instead of toggling collapse, and so we never nest buttons.
      const onToggleCollapse = vi.fn()
      render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
          onToggleCollapse={onToggleCollapse}
        />
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Collection actions' })
      )
      expect(onToggleCollapse).not.toHaveBeenCalled()
      // NES-1707 moved Publish into the dialog footer; Edit is the menu's
      // always-present item, which is all this assertion needs (proof the
      // click opened the menu rather than toggling collapse).
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    })

    it('points aria-controls at the mounted content region when expanded and drops it when collapsed', () => {
      const { rerender } = render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
        >
          <div data-testid="children-payload" />
        </CollectionCard>
      )
      const toggle = screen.getByTestId('CollectionCardToggle-page-1')
      const controls = toggle.getAttribute('aria-controls')
      expect(controls).toBe('collection-content-page-1')
      // The referenced element must actually exist while expanded.
      expect(document.getElementById(controls as string)).toBeInTheDocument()

      // Collapsed: the region unmounts, so we must not dangle a reference.
      rerender(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
          collapsed
        >
          <div data-testid="children-payload" />
        </CollectionCard>
      )
      expect(
        screen.getByTestId('CollectionCardToggle-page-1')
      ).not.toHaveAttribute('aria-controls')
    })

    it('does not toggle while busy (a drop mutation is settling)', async () => {
      // Collapsing mid-settle would unmount the SortableContext under dnd-kit.
      const onToggleCollapse = vi.fn()
      render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
          onToggleCollapse={onToggleCollapse}
          busy
        />
      )
      const toggle = screen.getByTestId('CollectionCardToggle-page-1')
      expect(toggle).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(toggle)
      toggle.focus()
      await userEvent.keyboard('{Enter}')
      expect(onToggleCollapse).not.toHaveBeenCalled()
    })

    it('lets Space scroll natively while busy instead of swallowing the keypress', () => {
      // While busy the toggle is inert; it must NOT preventDefault on Space,
      // or the user loses native page scroll for no effect.
      render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
          onToggleCollapse={vi.fn()}
          busy
        />
      )
      const toggle = screen.getByTestId('CollectionCardToggle-page-1')
      // fireEvent returns false when the event was cancelled (preventDefault).
      const notCancelledWhenBusy = fireEvent.keyDown(toggle, { key: ' ' })
      expect(notCancelledWhenBusy).toBe(true)
    })

    it('prevents default on Space when not busy (suppresses page scroll while toggling)', () => {
      render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
          onToggleCollapse={vi.fn()}
        />
      )
      const toggle = screen.getByTestId('CollectionCardToggle-page-1')
      const notCancelled = fireEvent.keyDown(toggle, { key: ' ' })
      expect(notCancelled).toBe(false)
    })

    it('does not throw when the header is toggled without an onToggleCollapse handler', async () => {
      render(
        <CollectionCard
          collection={makeCollection({ templates: [journeyRef('j1')] })}
        />
      )
      await expect(
        userEvent.click(screen.getByTestId('CollectionCardToggle-page-1'))
      ).resolves.not.toThrow()
    })
  })
})
