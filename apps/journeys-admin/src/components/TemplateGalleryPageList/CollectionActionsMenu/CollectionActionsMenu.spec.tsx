import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'

import { CollectionActionsMenu } from './CollectionActionsMenu'

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

describe('CollectionActionsMenu', () => {
  it('opens the menu and surfaces Edit / Publish / Remove for a draft', async () => {
    render(
      <CollectionActionsMenu
        collection={makeCollection({
          templates: [
            {
              __typename: 'TemplateGalleryItem',
              id: 'j1',
              title: 'j1',
              primaryImageBlock: null
            }
          ]
        })}
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
      screen.getByRole('menuitem', { name: 'Remove Collection' })
    ).toBeInTheDocument()
  })

  it('shows Unpublish (and hides Publish) for a published collection', async () => {
    render(
      <CollectionActionsMenu
        collection={makeCollection({
          status: TemplateGalleryPageStatus.published,
          publishedAt: '2026-05-06T00:00:00Z',
          templates: [
            {
              __typename: 'TemplateGalleryItem',
              id: 'j1',
              title: 'j1',
              primaryImageBlock: null
            }
          ]
        })}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    expect(
      screen.getByRole('menuitem', { name: 'Unpublish' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Publish' })
    ).not.toBeInTheDocument()
  })

  it('invokes onEdit with the collection', async () => {
    const handleEdit = jest.fn()
    const collection = makeCollection({ id: 'page-42' })
    render(
      <CollectionActionsMenu collection={collection} onEdit={handleEdit} />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Collection actions' })
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(handleEdit).toHaveBeenCalledWith(collection)
  })

  it('disables the actions button when busy', () => {
    render(<CollectionActionsMenu collection={makeCollection()} busy />)
    expect(
      screen.getByRole('button', { name: 'Collection actions' })
    ).toBeDisabled()
  })
})
