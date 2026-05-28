import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement, ReactNode } from 'react'

import '../../../../test/i18n'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'

import { CollectionChip } from './CollectionChip'

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
    templates: [
      {
        __typename: 'TemplateGalleryItem',
        id: 'j1',
        title: 'a',
        primaryImageBlock: null
      },
      {
        __typename: 'TemplateGalleryItem',
        id: 'j2',
        title: 'b',
        primaryImageBlock: null
      }
    ],
    ...overrides
  }
}

function Wrapper({ children }: { children: ReactNode }): ReactElement {
  // useDroppable inside CollectionChip requires a DndContext ancestor.
  return <DndContext>{children}</DndContext>
}

describe('CollectionChip', () => {
  it('renders title and count', () => {
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection()}
          selected={false}
          onSelect={jest.fn()}
        />
      </Wrapper>
    )
    expect(screen.getByText('My Collection')).toBeInTheDocument()
    expect(screen.getByText('2 templates')).toBeInTheDocument()
  })

  it('calls onSelect with the collection id when clicked', async () => {
    const handleSelect = jest.fn()
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection({ id: 'col-42' })}
          selected={false}
          onSelect={handleSelect}
        />
      </Wrapper>
    )
    await userEvent.click(screen.getByTestId('CollectionChip-col-42'))
    expect(handleSelect).toHaveBeenCalledWith('col-42')
  })

  it('marks aria-pressed when selected', () => {
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection({ id: 'col-1' })}
          selected
          onSelect={jest.fn()}
        />
      </Wrapper>
    )
    expect(screen.getByTestId('CollectionChip-col-1')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('renders a "Live" status label for a published collection', () => {
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection({
            status: TemplateGalleryPageStatus.published,
            publishedAt: '2026-05-06T00:00:00Z'
          })}
          selected={false}
          onSelect={jest.fn()}
        />
      </Wrapper>
    )
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders a "Draft" status label for an unpublished collection', () => {
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection({
            status: TemplateGalleryPageStatus.draft
          })}
          selected={false}
          onSelect={jest.fn()}
        />
      </Wrapper>
    )
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('shows a "+N" overflow tile when a collection has more than four templates', () => {
    const templates = Array.from({ length: 6 }, (_, index) => ({
      __typename: 'TemplateGalleryItem' as const,
      id: `j${index}`,
      title: `t${index}`,
      primaryImageBlock: null
    }))
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection({ templates })}
          selected={false}
          onSelect={jest.fn()}
        />
      </Wrapper>
    )
    // Six templates → three image tiles + a "+3" overflow tile (6 - 3).
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByText('6 templates')).toBeInTheDocument()
  })

  it('shows no overflow tile when a collection has four or fewer templates', () => {
    const templates = Array.from({ length: 4 }, (_, index) => ({
      __typename: 'TemplateGalleryItem' as const,
      id: `j${index}`,
      title: `t${index}`,
      primaryImageBlock: null
    }))
    render(
      <Wrapper>
        <CollectionChip
          collection={makeCollection({ templates })}
          selected={false}
          onSelect={jest.fn()}
        />
      </Wrapper>
    )
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })
})
