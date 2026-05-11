import { Reference } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../../libs/useTemplateGalleryPageAssignJourneyMutation'
import { useTemplateGalleryPageReorderTemplateMutation } from '../../../libs/useTemplateGalleryPageReorderTemplateMutation'
import { parseDropZoneId } from '../Droppables'

export interface UseDragEndHandlerParams {
  /** Map of journeyId → full Journey (from the team's templates query). */
  journeyById: ReadonlyMap<string, Journey>
  /** Map of templateId → its parent collection. Templates not in any
   * collection are absent from this map. */
  templateIdToCollection: ReadonlyMap<string, TemplateGalleryPage>
  /** Map of collectionId → collection. */
  collectionsById: ReadonlyMap<string, TemplateGalleryPage>
  /** True while a previous drop's mutation is still in flight. The hook
   * uses it as a defensive guard and the parent uses it to gate
   * droppable wrappers; both readers see the same value. */
  dragInFlight: boolean
  /** Setter for `dragInFlight` — the hook flips it on entry to a real
   * mutation and off in the finally block. */
  setDragInFlight: (next: boolean) => void
  /** Setter for the active drag id — the hook clears it on drop. */
  setActiveDragId: (next: string | null) => void
}

/**
 * Returns a `handleDragEnd` callback that dispatches a dnd-kit drop into
 * either `templateGalleryPageReorderTemplate` (intra-collection move)
 * or `templateGalleryPageAssignJourney` (cross-collection move,
 * add-from-unsectioned, or remove-to-unsectioned). Owns the optimistic
 * responses and the source-page `cache.modify` for cross-collection
 * moves.
 *
 * Extracted from TemplateGalleryPageList so the dispatch logic is
 * unit-testable in isolation.
 */
export function useDragEndHandler(
  params: UseDragEndHandlerParams
): (event: DragEndEvent) => Promise<void> {
  const {
    journeyById,
    templateIdToCollection,
    collectionsById,
    dragInFlight,
    setDragInFlight,
    setActiveDragId
  } = params
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [templateGalleryPageAssignJourney] =
    useTemplateGalleryPageAssignJourneyMutation()
  const [templateGalleryPageReorderTemplate] =
    useTemplateGalleryPageReorderTemplateMutation()

  return async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveDragId(null)
    // Defensive — handleDragStart already short-circuits while a mutation
    // is in flight, but keep the guard so reorders can't interleave.
    if (dragInFlight) return
    const { active, over } = event
    if (over == null) return

    const templateId = String(active.id)
    const sourceCollection = templateIdToCollection.get(templateId) ?? null

    // overId is either a sortable item id (a journey id) or an encoded
    // drop-zone id from `encodeDropZoneId`.
    const overId = String(over.id)
    let targetCollectionId: string | null
    let targetIndex: number | null
    const overZone = parseDropZoneId(overId)
    if (overZone != null) {
      targetCollectionId = overZone.kind === 'collection' ? overZone.id : null
      targetIndex = null // dropped on the zone itself, not a specific item
    } else {
      // overId is another journey id. Look up its parent collection (or
      // unsectioned) and its index inside that list.
      const overCollection = templateIdToCollection.get(overId) ?? null
      targetCollectionId = overCollection?.id ?? null
      if (overCollection != null) {
        targetIndex = overCollection.templates.findIndex(
          (tpl) => tpl.id === overId
        )
      } else {
        targetIndex = null // unsectioned: order is implicit, no reorder there
      }
    }

    // unsectioned -> unsectioned: no-op
    if (sourceCollection == null && targetCollectionId == null) return

    // Published guard on either side blocks every kind of move.
    if (sourceCollection?.status === TemplateGalleryPageStatus.published) return
    if (targetCollectionId != null) {
      const targetCollection = collectionsById.get(targetCollectionId)
      if (targetCollection?.status === TemplateGalleryPageStatus.published)
        return
    }

    setDragInFlight(true)
    try {
      const sameCollection =
        sourceCollection != null &&
        targetCollectionId != null &&
        sourceCollection.id === targetCollectionId

      if (sameCollection) {
        // Intra-collection reorder. If we don't know the target index
        // (dropped on the zone background), no-op rather than guess.
        if (targetIndex == null) return
        const sourceIndex = sourceCollection.templates.findIndex(
          (tpl) => tpl.id === templateId
        )
        if (sourceIndex < 0 || sourceIndex === targetIndex) return
        // Optimistic response so the cache reflects the new order on
        // the SAME tick the drop happens — eliminates the brief flash
        // where the card snaps back to its source position before the
        // server response lands.
        const reorderedTemplates = [...sourceCollection.templates]
        const [moving] = reorderedTemplates.splice(sourceIndex, 1)
        reorderedTemplates.splice(targetIndex, 0, moving)
        await templateGalleryPageReorderTemplate({
          variables: {
            pageId: sourceCollection.id,
            journeyId: templateId,
            order: targetIndex
          },
          optimisticResponse: {
            templateGalleryPageReorderTemplate: {
              ...sourceCollection,
              templates: reorderedTemplates
            }
          }
        })
      } else {
        // Membership change: cross-collection move, add from unsectioned, or
        // remove back to unsectioned. The server enforces the
        // single-membership invariant; passing pageId: null unassigns.
        const movingFromSource = sourceCollection?.templates.find(
          (tpl) => tpl.id === templateId
        )
        const movingFromUnsectioned = journeyById.get(templateId)
        const movingTemplate =
          movingFromSource ??
          (movingFromUnsectioned != null
            ? {
                __typename: 'Journey' as const,
                id: movingFromUnsectioned.id,
                title: movingFromUnsectioned.title,
                primaryImageBlock:
                  movingFromUnsectioned.primaryImageBlock != null
                    ? {
                        __typename: 'ImageBlock' as const,
                        id: movingFromUnsectioned.primaryImageBlock.id,
                        src: movingFromUnsectioned.primaryImageBlock.src,
                        alt: movingFromUnsectioned.primaryImageBlock.alt
                      }
                    : null
              }
            : null)
        const targetCollection =
          targetCollectionId != null
            ? collectionsById.get(targetCollectionId)
            : null
        const assignResult = await templateGalleryPageAssignJourney({
          variables: { journeyId: templateId, pageId: targetCollectionId },
          // Optimistic + cache.modify so both the target page (gain) and
          // the source page (loss) update in the same tick as the drop.
          // The server response replaces the optimistic write for the
          // returned page; the source-page modify is a sibling write the
          // response doesn't cover (the mutation only returns one page).
          optimisticResponse:
            targetCollection != null && movingTemplate != null
              ? {
                  templateGalleryPageAssignJourney: {
                    ...targetCollection,
                    templates: [...targetCollection.templates, movingTemplate]
                  }
                }
              : sourceCollection != null
                ? {
                    templateGalleryPageAssignJourney: {
                      ...sourceCollection,
                      templates: sourceCollection.templates.filter(
                        (tpl) => tpl.id !== templateId
                      )
                    }
                  }
                : undefined,
          update: (cache) => {
            // Trim the moving template out of the SOURCE page's cached
            // templates list. Cross-collection moves return only the
            // target; without this the source page keeps the moving
            // ref stale until the next refetch.
            if (
              sourceCollection == null ||
              sourceCollection.id === targetCollectionId
            ) {
              return
            }
            const sourceCacheId = cache.identify({
              __typename: 'TemplateGalleryPage',
              id: sourceCollection.id
            })
            const movedRef = cache.identify({
              __typename: 'Journey',
              id: templateId
            })
            if (sourceCacheId == null || movedRef == null) return
            cache.modify({
              id: sourceCacheId,
              fields: {
                templates(existing) {
                  if (!Array.isArray(existing)) return existing
                  return (existing as Reference[]).filter(
                    (ref) => ref.__ref !== movedRef
                  )
                }
              }
            })
          }
        })
        // Detect silent server rejection. The mutation can succeed at
        // the GraphQL layer (no errors) but return a page that still
        // doesn't include the journey we asked it to add — typically
        // when the journey's team ≠ the page's team or the journey
        // isn't a template. Apollo merges the response over the
        // optimistic write, so the UI silently bounces the card back
        // to the unsectioned section. Surface a snackbar so the user
        // knows the move didn't take.
        if (targetCollectionId != null) {
          const returnedPage =
            assignResult.data?.templateGalleryPageAssignJourney
          const accepted =
            returnedPage?.templates.some((tpl) => tpl.id === templateId) ??
            false
          if (!accepted) {
            enqueueSnackbar(
              t("Couldn't move template — the server rejected the move."),
              { variant: 'error', preventDuplicate: true }
            )
          }
        }
      }
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : t("Couldn't move template"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      setDragInFlight(false)
    }
  }
}
