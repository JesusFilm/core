import { DragEndEvent } from '@dnd-kit/core'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { MutableRefObject } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import {
  sendCollectionTemplateDragEvent,
  sendCollectionTemplateRemoveEvent
} from '../../../libs/sendCollectionEvent'
import { useTemplateGalleryPageLinkJourneyMutation } from '../../../libs/useTemplateGalleryPageLinkJourneyMutation'
import { useTemplateGalleryPageMoveJourneyMutation } from '../../../libs/useTemplateGalleryPageMoveJourneyMutation'
import { useTemplateGalleryPageRemoveJourneyMutation } from '../../../libs/useTemplateGalleryPageRemoveJourneyMutation'
import { useTemplateGalleryPageReorderTemplateMutation } from '../../../libs/useTemplateGalleryPageReorderTemplateMutation'
import { DropAction, parseCardId, parseDropZoneId } from '../Droppables'

type GalleryItem = TemplateGalleryPage['templates'][number]
type Membership = TemplateGalleryPage['memberships'][number]

/** Where one template lives, derived from every collection's `memberships`. */
export interface JourneyMembership {
  homeCollectionId: string | null
  collectionIds: readonly string[]
}

export interface UseDragEndHandlerParams {
  /** Map of journeyId → full Journey (from the team's templates query). */
  journeyById: ReadonlyMap<string, Journey>
  /** Map of collectionId → collection. */
  collectionsById: ReadonlyMap<string, TemplateGalleryPage>
  /** Map of journeyId → its memberships. Absent when in no collection. */
  membershipsByJourneyId: ReadonlyMap<string, JourneyMembership>
  /** Synchronous in-flight guard. The ref is the source of truth for
   * "is a drop currently being processed?" — closure-captured state
   * would read stale `false` for a second drop arriving in the same
   * React batch. The hook flips it on entry to a real mutation and off
   * in finally. The parent also flips its mirror state for rendering. */
  dragInFlightRef: MutableRefObject<boolean>
  /** Setter for `dragInFlight` state — drives busy chips and droppable
   * lock in the parent's render. The hook flips it alongside the ref. */
  setDragInFlight: (next: boolean) => void
  /** Setter for the active drag id — the hook clears it on drop. */
  setActiveDragId: (next: string | null) => void
  /**
   * NES-1717: true when the given collection is currently collapsed. A drop
   * onto a collapsed collection lands on its slim drop strip, so the user
   * can't see the template arrive — we surface a confirmation toast.
   * Defaults to "never collapsed" when omitted.
   */
  isCollectionCollapsed?: (collectionId: string) => boolean
}

/** What the card was dropped on, decoded from dnd-kit's `over.id`. */
type DropTarget =
  | { kind: 'reorder'; index: number }
  | { kind: 'action'; collectionId: string; action: DropAction }
  | { kind: 'collection'; collectionId: string }
  | { kind: 'unsectioned' }

/**
 * Returns a `handleDragEnd` callback that dispatches a dnd-kit drop into
 * the right mutation:
 *  - a drop on a card in the card's own collection → reorder;
 *  - a drop on a collection's "Move here" box → move (the membership
 *    relocates, keeping its home / link role);
 *  - a drop on "Link here" (or "Add here" from All Templates) → link;
 *  - a drop on All Templates → remove from the source collection;
 *  - a drop on a collection but between its boxes → nothing, plus a hint.
 *
 * Owns the optimistic responses. Each mutation returns every page it
 * changed (with `memberships`), so Apollo's normalized merge settles the
 * final state; `refetchQueries` is the belt-and-braces from NES-1668.
 *
 * Extracted from TemplateGalleryPageList so the dispatch logic is
 * unit-testable in isolation.
 */
export function useDragEndHandler(
  params: UseDragEndHandlerParams
): (event: DragEndEvent) => Promise<void> {
  const {
    journeyById,
    collectionsById,
    membershipsByJourneyId,
    dragInFlightRef,
    setDragInFlight,
    setActiveDragId,
    isCollectionCollapsed
  } = params
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [templateGalleryPageLinkJourney] =
    useTemplateGalleryPageLinkJourneyMutation()
  const [templateGalleryPageMoveJourney] =
    useTemplateGalleryPageMoveJourneyMutation()
  const [templateGalleryPageRemoveJourney] =
    useTemplateGalleryPageRemoveJourneyMutation()
  const [templateGalleryPageReorderTemplate] =
    useTemplateGalleryPageReorderTemplateMutation()

  // The narrow TemplateGalleryItem shape for optimistic writes: reuse the
  // ref a collection already holds, else build one from the journey.
  function galleryItemFor(journeyId: string): GalleryItem | null {
    for (const collection of collectionsById.values()) {
      const item = collection.templates.find((tpl) => tpl.id === journeyId)
      if (item != null) return item
    }
    const journey = journeyById.get(journeyId)
    if (journey == null) return null
    return {
      __typename: 'TemplateGalleryItem',
      id: journey.id,
      title: journey.title,
      primaryImageBlock:
        journey.primaryImageBlock != null
          ? {
              __typename: 'ImageBlock',
              id: journey.primaryImageBlock.id,
              src: journey.primaryImageBlock.src,
              alt: journey.primaryImageBlock.alt
            }
          : null
    }
  }

  function withoutJourney(
    collection: TemplateGalleryPage,
    journeyId: string
  ): TemplateGalleryPage {
    return {
      ...collection,
      templates: collection.templates.filter((tpl) => tpl.id !== journeyId),
      memberships: collection.memberships.filter(
        (membership) => membership.journeyId !== journeyId
      )
    }
  }

  function withJourney(
    collection: TemplateGalleryPage,
    item: GalleryItem,
    isHome: boolean
  ): TemplateGalleryPage {
    const membership: Membership = {
      __typename: 'TemplateGalleryPageMembership',
      journeyId: item.id,
      isHome
    }
    return {
      ...collection,
      templates: [...collection.templates, item],
      memberships: [...collection.memberships, membership]
    }
  }

  function showError(error: unknown, fallback: string): void {
    enqueueSnackbar(error instanceof Error ? error.message : fallback, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  function templateTitle(journeyId: string): string {
    return journeyById.get(journeyId)?.title ?? t('template')
  }

  async function linkInto(
    journeyId: string,
    target: TemplateGalleryPage,
    source: TemplateGalleryPage | null
  ): Promise<void> {
    const item = galleryItemFor(journeyId)
    const hasHome =
      membershipsByJourneyId.get(journeyId)?.homeCollectionId != null
    const targetWasCollapsed = isCollectionCollapsed?.(target.id) === true
    const { data } = await templateGalleryPageLinkJourney({
      variables: { journeyId, pageId: target.id },
      refetchQueries: ['GetTemplateGalleryPages'],
      optimisticResponse:
        item != null
          ? {
              templateGalleryPageLinkJourney: withJourney(
                target,
                item,
                !hasHome
              )
            }
          : undefined
    })
    const returned = data?.templateGalleryPageLinkJourney
    const accepted =
      returned?.memberships.some((m) => m.journeyId === journeyId) ?? false
    if (!accepted) {
      // Success-shaped response whose page doesn't include the journey —
      // typically the journey's team ≠ the page's team or it isn't a
      // template. Apollo has already rolled the optimistic write back.
      enqueueSnackbar(
        t("Couldn't add template — the server rejected the drop."),
        { variant: 'error', preventDuplicate: true }
      )
      return
    }
    sendCollectionTemplateDragEvent({
      collectionId: target.id,
      templateId: journeyId,
      mode: source == null ? 'add' : 'link'
    })
    const title = templateTitle(journeyId)
    const collection = returned?.title ?? target.title
    if (source == null) {
      // From All Templates the card visibly leaves the pool; only confirm
      // when it landed somewhere the user can't see (NES-1717).
      if (targetWasCollapsed) {
        enqueueSnackbar(t('Added to {{collection}}', { collection }), {
          variant: 'success',
          preventDuplicate: true
        })
      }
      return
    }
    enqueueSnackbar(
      t('Linked {{template}} into {{collection}}. Still in {{source}}.', {
        template: title,
        collection,
        source: source.title
      }),
      { variant: 'success', preventDuplicate: true }
    )
  }

  async function moveTo(
    journeyId: string,
    source: TemplateGalleryPage,
    target: TemplateGalleryPage
  ): Promise<void> {
    const item = galleryItemFor(journeyId)
    const sourceMembership = source.memberships.find(
      (m) => m.journeyId === journeyId
    )
    const { data } = await templateGalleryPageMoveJourney({
      variables: { journeyId, fromPageId: source.id, toPageId: target.id },
      refetchQueries: ['GetTemplateGalleryPages'],
      optimisticResponse:
        item != null
          ? {
              templateGalleryPageMoveJourney: [
                withoutJourney(source, journeyId),
                withJourney(target, item, sourceMembership?.isHome ?? false)
              ]
            }
          : undefined
    })
    const returnedTarget = data?.templateGalleryPageMoveJourney.find(
      (page) => page.id === target.id
    )
    const accepted =
      returnedTarget?.memberships.some((m) => m.journeyId === journeyId) ??
      false
    if (!accepted) {
      enqueueSnackbar(
        t("Couldn't move template — the server rejected the move."),
        { variant: 'error', preventDuplicate: true }
      )
      return
    }
    sendCollectionTemplateDragEvent({
      collectionId: target.id,
      templateId: journeyId,
      mode: 'move'
    })
    enqueueSnackbar(
      t('Moved {{template}} to {{collection}}', {
        template: templateTitle(journeyId),
        collection: returnedTarget?.title ?? target.title
      }),
      { variant: 'success', preventDuplicate: true }
    )
  }

  async function removeFrom(
    journeyId: string,
    source: TemplateGalleryPage
  ): Promise<void> {
    const { data } = await templateGalleryPageRemoveJourney({
      variables: { journeyId, pageId: source.id },
      refetchQueries: ['GetTemplateGalleryPages'],
      optimisticResponse: {
        templateGalleryPageRemoveJourney: [withoutJourney(source, journeyId)]
      }
    })
    sendCollectionTemplateRemoveEvent({
      collectionId: source.id,
      templateId: journeyId,
      via: 'drag'
    })
    // The server also returns the page whose link became the new home,
    // when the removed membership was the home.
    const promoted = data?.templateGalleryPageRemoveJourney.find(
      (page) =>
        page.id !== source.id &&
        page.memberships.some((m) => m.journeyId === journeyId && m.isHome)
    )
    const title = templateTitle(journeyId)
    enqueueSnackbar(
      promoted != null
        ? t(
            'Removed {{template}} from {{collection}}. Its home is now {{home}}.',
            { template: title, collection: source.title, home: promoted.title }
          )
        : t('Removed {{template}} from {{collection}}', {
            template: title,
            collection: source.title
          }),
      { variant: 'success', preventDuplicate: true }
    )
  }

  function resolveTarget(
    overId: string,
    sourceCollection: TemplateGalleryPage | null
  ): DropTarget | null {
    const overZone = parseDropZoneId(overId)
    if (overZone?.kind === 'action') {
      return {
        kind: 'action',
        collectionId: overZone.collectionId,
        action: overZone.action
      }
    }
    if (overZone?.kind === 'collection') {
      return { kind: 'collection', collectionId: overZone.id }
    }
    if (overZone?.kind === 'unsectioned') return { kind: 'unsectioned' }

    // Not a zone: a card. Its zone says which section it sits in.
    const overCard = parseCardId(overId)
    if (overCard == null) return null
    if (overCard.zone.kind === 'unsectioned') return { kind: 'unsectioned' }
    if (sourceCollection != null && overCard.zone.id === sourceCollection.id) {
      const index = sourceCollection.templates.findIndex(
        (tpl) => tpl.id === overCard.journeyId
      )
      return { kind: 'reorder', index }
    }
    return { kind: 'collection', collectionId: overCard.zone.id }
  }

  return async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveDragId(null)
    // Defensive — handleDragStart already short-circuits while a mutation
    // is in flight, but keep the guard so reorders can't interleave.
    if (dragInFlightRef.current) return
    const { active, over } = event
    if (over == null) return

    const activeCard = parseCardId(String(active.id))
    if (activeCard == null) return
    const { journeyId } = activeCard
    const sourceCollection =
      activeCard.zone.kind === 'collection'
        ? (collectionsById.get(activeCard.zone.id) ?? null)
        : null

    const target = resolveTarget(String(over.id), sourceCollection)
    if (target == null) return
    // unsectioned → unsectioned, and a drop on the source collection's own
    // background (no slot to reorder to): nothing to do.
    if (target.kind === 'unsectioned' && sourceCollection == null) return
    if (
      target.kind === 'collection' &&
      sourceCollection?.id === target.collectionId
    ) {
      return
    }

    // `setDragInFlight` in the parent is a wrapper that flips both the
    // state and the ref together — call it once, never set the ref
    // directly here (Mike review, NES-1644).
    setDragInFlight(true)
    try {
      switch (target.kind) {
        case 'reorder': {
          if (sourceCollection == null || target.index < 0) return
          const sourceIndex = sourceCollection.templates.findIndex(
            (tpl) => tpl.id === journeyId
          )
          if (sourceIndex < 0 || sourceIndex === target.index) return
          // Optimistic response so the cache reflects the new order on
          // the SAME tick the drop happens — eliminates the brief flash
          // where the card snaps back to its source position before the
          // server response lands.
          const reorderedTemplates = [...sourceCollection.templates]
          const [moving] = reorderedTemplates.splice(sourceIndex, 1)
          reorderedTemplates.splice(target.index, 0, moving)
          await templateGalleryPageReorderTemplate({
            variables: {
              pageId: sourceCollection.id,
              journeyId,
              order: target.index
            },
            optimisticResponse: {
              templateGalleryPageReorderTemplate: {
                ...sourceCollection,
                templates: reorderedTemplates
              }
            }
          })
          return
        }
        case 'collection': {
          // Landed on another collection but between its Move / Link boxes.
          // Never guess: say what to aim for.
          enqueueSnackbar(t('Drop on “Move here” or “Link here”.'), {
            variant: 'info',
            preventDuplicate: true
          })
          return
        }
        case 'unsectioned': {
          if (sourceCollection == null) return
          await removeFrom(journeyId, sourceCollection)
          return
        }
        case 'action': {
          const targetCollection = collectionsById.get(target.collectionId)
          if (targetCollection == null) return
          // "Already here" is a disabled droppable, so this only guards a
          // stale drop that raced a membership change.
          const alreadyThere =
            membershipsByJourneyId
              .get(journeyId)
              ?.collectionIds.includes(target.collectionId) ?? false
          if (alreadyThere) return
          if (sourceCollection == null || target.action === 'link') {
            await linkInto(journeyId, targetCollection, sourceCollection)
          } else {
            await moveTo(journeyId, sourceCollection, targetCollection)
          }
          return
        }
      }
    } catch (error) {
      showError(error, t("Couldn't move template"))
    } finally {
      setDragInFlight(false)
    }
  }
}
