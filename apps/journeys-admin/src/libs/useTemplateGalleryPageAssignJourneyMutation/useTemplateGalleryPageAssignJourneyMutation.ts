import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  TemplateGalleryPageAssignJourney,
  TemplateGalleryPageAssignJourneyVariables
} from '../../../__generated__/TemplateGalleryPageAssignJourney'

// Atomic single-mutation drag-and-drop: assigns a journey to a collection,
// reassigns it across collections (the server drops the previous join row
// inside the same transaction), or unassigns it (`pageId: null`).
// Server enforces the single-membership invariant.
//
// Return is nullable because unassigning a journey that wasn't in any
// collection is an idempotent no-op that returns null.
//
// No `refetchQueries` here. The selection set below is byte-identical to
// `GetTemplateGalleryPages`, so Apollo's normalized cache merge covers
// every field the UI reads off the target page. The call site in
// `TemplateGalleryPageList.tsx` adds a `cache.modify` that trims the
// moving journey out of the SOURCE page's `templates` list — the only
// source-page-derived UI state. A background refetch on top of those
// would race with the next optimistic write and produce a one-frame
// "ghost card" flash on rapid back-to-back drops (NES-1539 review todo
// 021).
export const TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY = gql`
  mutation TemplateGalleryPageAssignJourney($journeyId: ID!, $pageId: ID) {
    templateGalleryPageAssignJourney(journeyId: $journeyId, pageId: $pageId) {
      id
      title
      description
      slug
      status
      creatorName
      creatorImageSrc
      creatorImageAlt
      mediaUrl
      publishedAt
      createdAt
      updatedAt
      templates {
        id
        title
        primaryImageBlock {
          id
          src
          alt
        }
      }
    }
  }
`

export function useTemplateGalleryPageAssignJourneyMutation(
  options?: MutationHookOptions<
    TemplateGalleryPageAssignJourney,
    TemplateGalleryPageAssignJourneyVariables
  >
): MutationTuple<
  TemplateGalleryPageAssignJourney,
  TemplateGalleryPageAssignJourneyVariables
> {
  return useMutation<
    TemplateGalleryPageAssignJourney,
    TemplateGalleryPageAssignJourneyVariables
  >(TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY, options)
}
