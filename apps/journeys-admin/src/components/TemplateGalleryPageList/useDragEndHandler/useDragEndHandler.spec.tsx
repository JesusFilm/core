import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { DragEndEvent } from '@dnd-kit/core'
import { act, renderHook } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { getTemplateGalleryPageAssignJourneyMock } from '../../../libs/useTemplateGalleryPageAssignJourneyMutation/useTemplateGalleryPageAssignJourneyMutation.mock'
import { getTemplateGalleryPageReorderTemplateMock } from '../../../libs/useTemplateGalleryPageReorderTemplateMutation/useTemplateGalleryPageReorderTemplateMutation.mock'
import { GET_TEMPLATE_GALLERY_PAGES } from '../../../libs/useTemplateGalleryPagesQuery'
import { encodeDropZoneId } from '../Droppables'

import { useDragEndHandler } from './useDragEndHandler'

const journey = (id: string, title: string): Journey =>
  ({
    __typename: 'Journey',
    id,
    title,
    primaryImageBlock: null
  }) as unknown as Journey

const templateRef = (j: Journey): TemplateGalleryPage['templates'][number] => ({
  __typename: 'Journey',
  id: j.id,
  title: j.title,
  primaryImageBlock: null
})

function makeCollection(
  id: string,
  templates: Journey[],
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id,
    title: id,
    description: '',
    slug: id,
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: templates.map(templateRef),
    ...overrides
  }
}

interface Harness {
  collections: TemplateGalleryPage[]
  journeys: Journey[]
}

function buildIndexes({ collections, journeys }: Harness): {
  journeyById: Map<string, Journey>
  templateIdToCollection: Map<string, TemplateGalleryPage>
  collectionsById: Map<string, TemplateGalleryPage>
} {
  const journeyById = new Map(journeys.map((j) => [j.id, j]))
  const templateIdToCollection = new Map<string, TemplateGalleryPage>()
  const collectionsById = new Map<string, TemplateGalleryPage>()
  for (const c of collections) {
    collectionsById.set(c.id, c)
    for (const tpl of c.templates) templateIdToCollection.set(tpl.id, c)
  }
  return { journeyById, templateIdToCollection, collectionsById }
}

function wrapperWithMocks(
  mocks: ReadonlyArray<MockedResponse>,
  cache: InMemoryCache = new InMemoryCache()
): ({ children }: { children: ReactNode }) => JSX.Element {
  return function Wrapper({ children }) {
    return (
      <MockedProvider cache={cache} mocks={mocks}>
        <SnackbarProvider>{children as JSX.Element}</SnackbarProvider>
      </MockedProvider>
    )
  }
}

function dropEvent(activeId: string, overId: string | null): DragEndEvent {
  return {
    active: { id: activeId },
    over: overId == null ? null : { id: overId }
  } as unknown as DragEndEvent
}

describe('useDragEndHandler', () => {
  it('intra-collection reorder fires templateGalleryPageReorderTemplate', async () => {
    const j1 = journey('j1', 'A')
    const j2 = journey('j2', 'B')
    const j3 = journey('j3', 'C')
    const collection = makeCollection('page-1', [j1, j2, j3])
    const indexes = buildIndexes({
      collections: [collection],
      journeys: [j1, j2, j3]
    })

    const reorderMock = getTemplateGalleryPageReorderTemplateMock({
      pageId: 'page-1',
      journeyId: 'j1',
      order: 2
    })
    const setDragInFlight = jest.fn()
    const setActiveDragId = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId
        }),
      { wrapper: wrapperWithMocks([reorderMock]) }
    )

    // Drop j1 onto j3 (display index 2 inside its own collection).
    await act(async () => {
      await result.current(dropEvent('j1', 'j3'))
    })

    expect(reorderMock.result).toHaveBeenCalledTimes(1)
    expect(setActiveDragId).toHaveBeenCalledWith(null)
    expect(setDragInFlight).toHaveBeenNthCalledWith(1, true)
    expect(setDragInFlight).toHaveBeenLastCalledWith(false)
  })

  it('cross-collection move fires templateGalleryPageAssignJourney with target pageId', async () => {
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1])
    const target = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [source, target],
      journeys: [j1]
    })

    const assignMock = getTemplateGalleryPageAssignJourneyMock({
      journeyId: 'j1',
      pageId: 'page-B'
    })
    const setDragInFlight = jest.fn()
    const setActiveDragId = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId
        }),
      { wrapper: wrapperWithMocks([assignMock]) }
    )

    // Drop j1 onto the empty target collection's drop zone.
    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'collection', id: 'page-B' }))
      )
    })

    expect(assignMock.result).toHaveBeenCalledTimes(1)
  })

  // NES-1668 repro: drag a template from one draft collection to another and
  // verify the source page's cached templates array no longer contains the
  // moved journey. The mock returns the target page with j1 present so the
  // post-mutation `accepted` check passes and the source-side cache.modify
  // can run on the real-data pass. Pre-fix: source.templates still contains
  // the moved ref, which is what Sharon QA'd. Post-fix: source.templates is
  // empty.
  it('NES-1668: cross-collection move trims the moving journey from the source page', async () => {
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1])
    const target = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [source, target],
      journeys: [j1]
    })

    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' },
      data: { templateGalleryPages: [source, target] }
    })

    // Realistic server response: target page now contains the moved journey.
    const assignMock = getTemplateGalleryPageAssignJourneyMock(
      { journeyId: 'j1', pageId: 'page-B' },
      { id: 'page-B', templates: [templateRef(j1)] }
    )

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight: jest.fn(),
          setActiveDragId: jest.fn()
        }),
      { wrapper: wrapperWithMocks([assignMock], cache) }
    )

    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'collection', id: 'page-B' }))
      )
    })

    expect(assignMock.result).toHaveBeenCalledTimes(1)

    const cached = cache.readQuery<{
      templateGalleryPages: TemplateGalleryPage[]
    }>({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' }
    })
    const sourceAfter = cached?.templateGalleryPages.find(
      (p) => p.id === 'page-A'
    )
    const targetAfter = cached?.templateGalleryPages.find(
      (p) => p.id === 'page-B'
    )
    // Source must no longer reference the moved journey. Target gains it.
    expect(sourceAfter?.templates.map((t) => t.id)).toEqual([])
    expect(targetAfter?.templates.map((t) => t.id)).toEqual(['j1'])
  })

  it('drop on unsectioned fires assignJourney with pageId: null', async () => {
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1])
    const indexes = buildIndexes({
      collections: [source],
      journeys: [j1]
    })

    const assignMock = getTemplateGalleryPageAssignJourneyMock({
      journeyId: 'j1',
      pageId: null
    })
    const setDragInFlight = jest.fn()
    const setActiveDragId = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId
        }),
      { wrapper: wrapperWithMocks([assignMock]) }
    )

    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'unsectioned' }))
      )
    })

    expect(assignMock.result).toHaveBeenCalledTimes(1)
  })

  it('rejects drops when the source collection is published', async () => {
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1], {
      status: TemplateGalleryPageStatus.published
    })
    const target = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [source, target],
      journeys: [j1]
    })

    const assignMock = getTemplateGalleryPageAssignJourneyMock({
      journeyId: 'j1',
      pageId: 'page-B'
    })
    const setDragInFlight = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId: jest.fn()
        }),
      { wrapper: wrapperWithMocks([assignMock]) }
    )

    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'collection', id: 'page-B' }))
      )
    })

    expect(assignMock.result).not.toHaveBeenCalled()
    // No mutation kicked off → setDragInFlight(true) never fired either.
    expect(setDragInFlight).not.toHaveBeenCalledWith(true)
  })

  it('rejects drops when the target collection is published', async () => {
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1])
    const target = makeCollection('page-B', [], {
      status: TemplateGalleryPageStatus.published
    })
    const indexes = buildIndexes({
      collections: [source, target],
      journeys: [j1]
    })

    const assignMock = getTemplateGalleryPageAssignJourneyMock({
      journeyId: 'j1',
      pageId: 'page-B'
    })
    const setDragInFlight = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId: jest.fn()
        }),
      { wrapper: wrapperWithMocks([assignMock]) }
    )

    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'collection', id: 'page-B' }))
      )
    })

    expect(assignMock.result).not.toHaveBeenCalled()
    expect(setDragInFlight).not.toHaveBeenCalledWith(true)
  })

  it('is a no-op when sourceIndex === targetIndex (intra-collection same slot)', async () => {
    const j1 = journey('j1', 'A')
    const j2 = journey('j2', 'B')
    const collection = makeCollection('page-1', [j1, j2])
    const indexes = buildIndexes({
      collections: [collection],
      journeys: [j1, j2]
    })

    const reorderMock = getTemplateGalleryPageReorderTemplateMock({
      pageId: 'page-1',
      journeyId: 'j1',
      order: 0
    })
    const setDragInFlight = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId: jest.fn()
        }),
      { wrapper: wrapperWithMocks([reorderMock]) }
    )

    // Drop j1 onto itself — sourceIndex === targetIndex.
    await act(async () => {
      await result.current(dropEvent('j1', 'j1'))
    })

    expect(reorderMock.result).not.toHaveBeenCalled()
  })

  it('is a no-op when there is no over target', async () => {
    const j1 = journey('j1', 'A')
    const collection = makeCollection('page-1', [j1])
    const indexes = buildIndexes({
      collections: [collection],
      journeys: [j1]
    })

    const reorderMock = getTemplateGalleryPageReorderTemplateMock({
      pageId: 'page-1',
      journeyId: 'j1',
      order: 0
    })
    const setDragInFlight = jest.fn()
    const setActiveDragId = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight,
          setActiveDragId
        }),
      { wrapper: wrapperWithMocks([reorderMock]) }
    )

    await act(async () => {
      await result.current(dropEvent('j1', null))
    })

    expect(reorderMock.result).not.toHaveBeenCalled()
    expect(setActiveDragId).toHaveBeenCalledWith(null)
  })

  it('skips the dispatch when dragInFlight is true', async () => {
    // Use a real cross-collection drop target so this test proves the
    // guard is what's suppressing dispatch — not the same-slot no-op
    // short-circuit that would skip the mutation regardless.
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1])
    const target = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [source, target],
      journeys: [j1]
    })

    const assignMock = getTemplateGalleryPageAssignJourneyMock({
      journeyId: 'j1',
      pageId: 'page-B'
    })
    const setDragInFlight = jest.fn()

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: true,
          setDragInFlight,
          setActiveDragId: jest.fn()
        }),
      { wrapper: wrapperWithMocks([assignMock]) }
    )

    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'collection', id: 'page-B' }))
      )
    })

    expect(assignMock.result).not.toHaveBeenCalled()
    // The guard MUST short-circuit before setDragInFlight(true) too — if
    // a mutation had started, setDragInFlight would have been toggled.
    expect(setDragInFlight).not.toHaveBeenCalledWith(true)
  })

  it('does not trim the source cache when the server silently rejects the move', async () => {
    // The mutation can succeed at the GraphQL layer but return a target
    // page that does NOT include the journey we asked it to add — e.g.
    // when the journey's team mismatches the page's team. Apollo merges
    // the response over the optimistic write, so without a guard the
    // source-page cache.modify would still run on the real-response pass
    // and permanently drop the moving journey from the source page until
    // the next refetch. This test seeds the source page with the journey,
    // wires an assign mock that returns the target with empty templates,
    // and asserts the source's cached templates still hold the journey.
    const j1 = journey('j1', 'A')
    const source = makeCollection('page-A', [j1])
    const target = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [source, target],
      journeys: [j1]
    })

    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' },
      data: { templateGalleryPages: [source, target] }
    })

    // Silent rejection: returned target page does not include j1.
    const assignMock = getTemplateGalleryPageAssignJourneyMock(
      { journeyId: 'j1', pageId: 'page-B' },
      { id: 'page-B', templates: [] }
    )

    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlight: false,
          setDragInFlight: jest.fn(),
          setActiveDragId: jest.fn()
        }),
      { wrapper: wrapperWithMocks([assignMock], cache) }
    )

    await act(async () => {
      await result.current(
        dropEvent('j1', encodeDropZoneId({ kind: 'collection', id: 'page-B' }))
      )
    })

    expect(assignMock.result).toHaveBeenCalledTimes(1)

    const cached = cache.readQuery<{
      templateGalleryPages: TemplateGalleryPage[]
    }>({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' }
    })
    const sourceAfter = cached?.templateGalleryPages.find(
      (p) => p.id === 'page-A'
    )
    expect(sourceAfter?.templates.map((t) => t.id)).toEqual(['j1'])
  })
})
