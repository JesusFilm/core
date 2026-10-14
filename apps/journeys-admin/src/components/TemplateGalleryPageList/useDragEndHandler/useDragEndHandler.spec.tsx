import { InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { DragEndEvent } from '@dnd-kit/core'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'
import { type MockedFunction } from 'vitest'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import {
  sendCollectionTemplateDragEvent,
  sendCollectionTemplateRemoveEvent
} from '../../../libs/sendCollectionEvent'
import { getTemplateGalleryPageLinkJourneyMock } from '../../../libs/useTemplateGalleryPageLinkJourneyMutation/useTemplateGalleryPageLinkJourneyMutation.mock'
import { getTemplateGalleryPageMoveJourneyMock } from '../../../libs/useTemplateGalleryPageMoveJourneyMutation/useTemplateGalleryPageMoveJourneyMutation.mock'
import { getTemplateGalleryPageRemoveJourneyMock } from '../../../libs/useTemplateGalleryPageRemoveJourneyMutation/useTemplateGalleryPageRemoveJourneyMutation.mock'
import { getTemplateGalleryPageReorderTemplateMock } from '../../../libs/useTemplateGalleryPageReorderTemplateMutation/useTemplateGalleryPageReorderTemplateMutation.mock'
import { encodeCardId, encodeDropZoneId } from '../Droppables'

import { JourneyMembership, useDragEndHandler } from './useDragEndHandler'

vi.mock('../../../libs/sendCollectionEvent', () => ({
  sendCollectionTemplateDragEvent: vi.fn(),
  sendCollectionTemplateRemoveEvent: vi.fn()
}))

const mockSendCollectionTemplateDragEvent =
  sendCollectionTemplateDragEvent as MockedFunction<
    typeof sendCollectionTemplateDragEvent
  >
const mockSendCollectionTemplateRemoveEvent =
  sendCollectionTemplateRemoveEvent as MockedFunction<
    typeof sendCollectionTemplateRemoveEvent
  >

const journey = (id: string, title: string): Journey =>
  ({
    __typename: 'Journey',
    id,
    title,
    primaryImageBlock: null
  }) as unknown as Journey

const templateRef = (j: Journey): TemplateGalleryPage['templates'][number] => ({
  __typename: 'TemplateGalleryItem',
  id: j.id,
  title: j.title,
  primaryImageBlock: null
})

const membershipRef = (
  journeyId: string,
  isHome: boolean
): TemplateGalleryPage['memberships'][number] => ({
  __typename: 'TemplateGalleryPageMembership',
  journeyId,
  isHome
})

/**
 * `links` are journeys whose home is elsewhere; everything else in
 * `templates` is a home on this collection.
 */
function makeCollection(
  id: string,
  templates: Journey[],
  options: { links?: string[]; title?: string } = {}
): TemplateGalleryPage {
  const links = new Set(options.links ?? [])
  return {
    __typename: 'TemplateGalleryPage',
    id,
    title: options.title ?? id,
    description: '',
    slug: id,
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    media: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: templates.map(templateRef),
    memberships: templates.map((j) => membershipRef(j.id, !links.has(j.id)))
  }
}

interface Harness {
  collections: TemplateGalleryPage[]
  journeys: Journey[]
}

function buildIndexes({ collections, journeys }: Harness): {
  journeyById: Map<string, Journey>
  collectionsById: Map<string, TemplateGalleryPage>
  membershipsByJourneyId: Map<string, JourneyMembership>
} {
  const journeyById = new Map(journeys.map((j) => [j.id, j]))
  const collectionsById = new Map<string, TemplateGalleryPage>()
  const membershipsByJourneyId = new Map<string, JourneyMembership>()
  for (const c of collections) {
    collectionsById.set(c.id, c)
    for (const m of c.memberships) {
      const entry = membershipsByJourneyId.get(m.journeyId) ?? {
        homeCollectionId: null,
        collectionIds: []
      }
      membershipsByJourneyId.set(m.journeyId, {
        homeCollectionId: m.isHome ? c.id : entry.homeCollectionId,
        collectionIds: [...entry.collectionIds, c.id]
      })
    }
  }
  return { journeyById, collectionsById, membershipsByJourneyId }
}

function wrapperWithMocks(
  mocks: ReadonlyArray<MockLink.MockedResponse>,
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

const inCollection = (collectionId: string, journeyId: string): string =>
  encodeCardId({ zone: { kind: 'collection', id: collectionId }, journeyId })
const inPool = (journeyId: string): string =>
  encodeCardId({ zone: { kind: 'unsectioned' }, journeyId })
const moveInto = (collectionId: string): string =>
  encodeDropZoneId({ kind: 'action', collectionId, action: 'move' })
const linkInto = (collectionId: string): string =>
  encodeDropZoneId({ kind: 'action', collectionId, action: 'link' })
const collectionZone = (collectionId: string): string =>
  encodeDropZoneId({ kind: 'collection', id: collectionId })
const poolZone = encodeDropZoneId({ kind: 'unsectioned' })

function renderHandler(
  indexes: ReturnType<typeof buildIndexes>,
  mocks: ReadonlyArray<MockLink.MockedResponse>,
  extra: Partial<Parameters<typeof useDragEndHandler>[0]> = {}
): {
  handle: (event: DragEndEvent) => Promise<void>
  setDragInFlight: ReturnType<typeof vi.fn>
  setActiveDragId: ReturnType<typeof vi.fn>
} {
  const setDragInFlight = vi.fn()
  const setActiveDragId = vi.fn()
  const { result } = renderHook(
    () =>
      useDragEndHandler({
        ...indexes,
        dragInFlightRef: { current: false },
        setDragInFlight,
        setActiveDragId,
        ...extra
      }),
    { wrapper: wrapperWithMocks(mocks) }
  )
  return { handle: result.current, setDragInFlight, setActiveDragId }
}

describe('useDragEndHandler', () => {
  const j1 = journey('j1', 'A')
  const j2 = journey('j2', 'B')
  const j3 = journey('j3', 'C')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('intra-collection reorder fires templateGalleryPageReorderTemplate', async () => {
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
    const { handle, setDragInFlight } = renderHandler(indexes, [reorderMock])

    // Drop j1 onto j3 (display index 2 inside its own collection).
    await act(async () => {
      await handle(
        dropEvent(inCollection('page-1', 'j1'), inCollection('page-1', 'j3'))
      )
    })

    await waitFor(() => expect(reorderMock.result).toHaveBeenCalled())
    expect(setDragInFlight).toHaveBeenNthCalledWith(1, true)
    expect(setDragInFlight).toHaveBeenLastCalledWith(false)
  })

  it('drop on the collection background of its own collection is a no-op', async () => {
    const collection = makeCollection('page-1', [j1, j2])
    const indexes = buildIndexes({
      collections: [collection],
      journeys: [j1, j2]
    })
    const { handle, setDragInFlight } = renderHandler(indexes, [])

    await act(async () => {
      await handle(
        dropEvent(inCollection('page-1', 'j1'), collectionZone('page-1'))
      )
    })

    expect(setDragInFlight).not.toHaveBeenCalled()
  })

  it('"Move here" from another collection fires templateGalleryPageMoveJourney and reports it', async () => {
    const pageA = makeCollection('page-A', [j1], { title: 'Easter' })
    const pageB = makeCollection('page-B', [j2], { title: 'Youth' })
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1, j2]
    })
    const moveMock = getTemplateGalleryPageMoveJourneyMock(
      { journeyId: 'j1', fromPageId: 'page-A', toPageId: 'page-B' },
      [
        { id: 'page-A', title: 'Easter', templates: [], memberships: [] },
        {
          id: 'page-B',
          title: 'Youth',
          templates: [templateRef(j2), templateRef(j1)],
          memberships: [membershipRef('j2', true), membershipRef('j1', true)]
        }
      ]
    )
    const { handle } = renderHandler(indexes, [moveMock])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), moveInto('page-B')))
    })

    await waitFor(() => expect(moveMock.result).toHaveBeenCalled())
    expect(mockSendCollectionTemplateDragEvent).toHaveBeenCalledWith({
      collectionId: 'page-B',
      templateId: 'j1',
      mode: 'move'
    })
    await waitFor(() =>
      expect(screen.getByText('Moved A to Youth')).toBeInTheDocument()
    )
  })

  it('"Link here" from another collection fires templateGalleryPageLinkJourney and keeps the source', async () => {
    const pageA = makeCollection('page-A', [j1], { title: 'Easter' })
    const pageB = makeCollection('page-B', [j2], { title: 'Youth' })
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1, j2]
    })
    const linkMock = getTemplateGalleryPageLinkJourneyMock(
      { journeyId: 'j1', pageId: 'page-B' },
      {
        id: 'page-B',
        title: 'Youth',
        templates: [templateRef(j2), templateRef(j1)],
        memberships: [membershipRef('j2', true), membershipRef('j1', false)]
      }
    )
    const { handle } = renderHandler(indexes, [linkMock])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), linkInto('page-B')))
    })

    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
    expect(mockSendCollectionTemplateDragEvent).toHaveBeenCalledWith({
      collectionId: 'page-B',
      templateId: 'j1',
      mode: 'link'
    })
    await waitFor(() =>
      expect(
        screen.getByText('Linked A into Youth. Still in Easter.')
      ).toBeInTheDocument()
    )
  })

  it('"Add here" from All Templates links the journey as its home', async () => {
    const pageA = makeCollection('page-A', [], { title: 'Easter' })
    const indexes = buildIndexes({ collections: [pageA], journeys: [j1] })
    const linkMock = getTemplateGalleryPageLinkJourneyMock(
      { journeyId: 'j1', pageId: 'page-A' },
      {
        id: 'page-A',
        title: 'Easter',
        templates: [templateRef(j1)],
        memberships: [membershipRef('j1', true)]
      }
    )
    const { handle } = renderHandler(indexes, [linkMock])

    await act(async () => {
      await handle(dropEvent(inPool('j1'), linkInto('page-A')))
    })

    await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
    expect(mockSendCollectionTemplateDragEvent).toHaveBeenCalledWith({
      collectionId: 'page-A',
      templateId: 'j1',
      mode: 'add'
    })
    // The card visibly left the pool — no toast unless the target was
    // collapsed (NES-1717).
    expect(screen.queryByText(/Added to/)).not.toBeInTheDocument()
  })

  it('confirms an add into a collapsed collection with a toast (NES-1717)', async () => {
    const pageA = makeCollection('page-A', [], { title: 'Easter' })
    const indexes = buildIndexes({ collections: [pageA], journeys: [j1] })
    const linkMock = getTemplateGalleryPageLinkJourneyMock(
      { journeyId: 'j1', pageId: 'page-A' },
      {
        id: 'page-A',
        title: 'Easter',
        templates: [templateRef(j1)],
        memberships: [membershipRef('j1', true)]
      }
    )
    const { handle } = renderHandler(indexes, [linkMock], {
      isCollectionCollapsed: (id) => id === 'page-A'
    })

    await act(async () => {
      await handle(dropEvent(inPool('j1'), linkInto('page-A')))
    })

    await waitFor(() =>
      expect(screen.getByText('Added to Easter')).toBeInTheDocument()
    )
  })

  it('drop on another collection between the boxes does nothing and hints', async () => {
    const pageA = makeCollection('page-A', [j1])
    const pageB = makeCollection('page-B', [j2])
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1, j2]
    })
    const { handle, setDragInFlight } = renderHandler(indexes, [])

    await act(async () => {
      await handle(
        dropEvent(inCollection('page-A', 'j1'), collectionZone('page-B'))
      )
    })

    await waitFor(() =>
      expect(
        screen.getByText('Drop on “Move here” or “Link here”.')
      ).toBeInTheDocument()
    )
    expect(setDragInFlight).toHaveBeenLastCalledWith(false)
    expect(mockSendCollectionTemplateDragEvent).not.toHaveBeenCalled()
  })

  it('drop onto a card in another collection is treated like the collection background', async () => {
    const pageA = makeCollection('page-A', [j1])
    const pageB = makeCollection('page-B', [j2])
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1, j2]
    })
    const { handle } = renderHandler(indexes, [])

    await act(async () => {
      await handle(
        dropEvent(inCollection('page-A', 'j1'), inCollection('page-B', 'j2'))
      )
    })

    await waitFor(() =>
      expect(
        screen.getByText('Drop on “Move here” or “Link here”.')
      ).toBeInTheDocument()
    )
  })

  it('drop on All Templates removes the membership from the source collection', async () => {
    const pageA = makeCollection('page-A', [j1], { title: 'Easter' })
    const indexes = buildIndexes({ collections: [pageA], journeys: [j1] })
    const removeMock = getTemplateGalleryPageRemoveJourneyMock(
      { journeyId: 'j1', pageId: 'page-A' },
      [{ id: 'page-A', title: 'Easter', templates: [], memberships: [] }]
    )
    const { handle } = renderHandler(indexes, [removeMock])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), poolZone))
    })

    await waitFor(() => expect(removeMock.result).toHaveBeenCalled())
    expect(mockSendCollectionTemplateRemoveEvent).toHaveBeenCalledWith({
      collectionId: 'page-A',
      templateId: 'j1',
      via: 'drag'
    })
    await waitFor(() =>
      expect(screen.getByText('Removed A from Easter')).toBeInTheDocument()
    )
  })

  it('names the promoted home when the removed membership was the home', async () => {
    const pageA = makeCollection('page-A', [j1], { title: 'Easter' })
    const pageB = makeCollection('page-B', [j1], {
      title: 'Youth',
      links: ['j1']
    })
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1]
    })
    const removeMock = getTemplateGalleryPageRemoveJourneyMock(
      { journeyId: 'j1', pageId: 'page-A' },
      [
        { id: 'page-A', title: 'Easter', templates: [], memberships: [] },
        {
          id: 'page-B',
          title: 'Youth',
          templates: [templateRef(j1)],
          memberships: [membershipRef('j1', true)]
        }
      ]
    )
    const { handle } = renderHandler(indexes, [removeMock])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), poolZone))
    })

    await waitFor(() =>
      expect(
        screen.getByText('Removed A from Easter. Its home is now Youth.')
      ).toBeInTheDocument()
    )
  })

  it('drop from All Templates onto All Templates is a no-op', async () => {
    const indexes = buildIndexes({ collections: [], journeys: [j1] })
    const { handle, setDragInFlight } = renderHandler(indexes, [])

    await act(async () => {
      await handle(dropEvent(inPool('j1'), poolZone))
    })

    expect(setDragInFlight).not.toHaveBeenCalled()
  })

  it('ignores a drop onto a box of a collection that already holds the journey', async () => {
    const pageA = makeCollection('page-A', [j1])
    const pageB = makeCollection('page-B', [j1], { links: ['j1'] })
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1]
    })
    const { handle, setDragInFlight } = renderHandler(indexes, [])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), linkInto('page-B')))
    })

    expect(setDragInFlight).toHaveBeenLastCalledWith(false)
    expect(mockSendCollectionTemplateDragEvent).not.toHaveBeenCalled()
  })

  it('surfaces a snackbar and releases the lock when the server rejects a link', async () => {
    const pageA = makeCollection('page-A', [j1], { title: 'Easter' })
    const pageB = makeCollection('page-B', [], { title: 'Youth' })
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1]
    })
    // Success-shaped response whose page does not include the journey.
    const linkMock = getTemplateGalleryPageLinkJourneyMock(
      { journeyId: 'j1', pageId: 'page-B' },
      { id: 'page-B', title: 'Youth', templates: [], memberships: [] }
    )
    const { handle, setDragInFlight } = renderHandler(indexes, [linkMock])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), linkInto('page-B')))
    })

    await waitFor(() =>
      expect(
        screen.getByText(
          "Couldn't add template — the server rejected the drop."
        )
      ).toBeInTheDocument()
    )
    expect(setDragInFlight).toHaveBeenLastCalledWith(false)
    expect(mockSendCollectionTemplateDragEvent).not.toHaveBeenCalled()
  })

  it('surfaces the error and releases the lock when the mutation throws', async () => {
    const pageA = makeCollection('page-A', [j1])
    const pageB = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1]
    })
    const failingMock: MockLink.MockedResponse = {
      ...getTemplateGalleryPageMoveJourneyMock({
        journeyId: 'j1',
        fromPageId: 'page-A',
        toPageId: 'page-B'
      }),
      result: undefined,
      error: new Error('boom')
    }
    const { handle, setDragInFlight } = renderHandler(indexes, [failingMock])

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), moveInto('page-B')))
    })

    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument())
    expect(setDragInFlight).toHaveBeenLastCalledWith(false)
  })

  it('refuses a drop while a previous mutation is still in flight', async () => {
    const pageA = makeCollection('page-A', [j1])
    const pageB = makeCollection('page-B', [])
    const indexes = buildIndexes({
      collections: [pageA, pageB],
      journeys: [j1]
    })
    const setDragInFlight = vi.fn()
    const { result } = renderHook(
      () =>
        useDragEndHandler({
          ...indexes,
          dragInFlightRef: { current: true },
          setDragInFlight,
          setActiveDragId: vi.fn()
        }),
      { wrapper: wrapperWithMocks([]) }
    )

    await act(async () => {
      await result.current(
        dropEvent(inCollection('page-A', 'j1'), moveInto('page-B'))
      )
    })

    expect(setDragInFlight).not.toHaveBeenCalled()
  })

  it('clears the active drag id and does nothing when dropped outside every zone', async () => {
    const pageA = makeCollection('page-A', [j1])
    const indexes = buildIndexes({ collections: [pageA], journeys: [j1] })
    const { handle, setDragInFlight, setActiveDragId } = renderHandler(
      indexes,
      []
    )

    await act(async () => {
      await handle(dropEvent(inCollection('page-A', 'j1'), null))
    })

    expect(setActiveDragId).toHaveBeenCalledWith(null)
    expect(setDragInFlight).not.toHaveBeenCalled()
  })
})
