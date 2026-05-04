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
export const TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY = gql`
  mutation TemplateGalleryPageAssignJourney(
    $journeyId: ID!
    $pageId: ID
  ) {
    templateGalleryPageAssignJourney(
      journeyId: $journeyId
      pageId: $pageId
    ) {
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
  >(TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY, {
    // The mutation returns at most ONE affected page; for inter-collection
    // moves the source page's `templates` field becomes stale in the cache.
    // Refetching the team-scoped list is the cheapest correct fix while the
    // page list is small (V1 — pagination is a V3 follow-up per the plan).
    refetchQueries: ['GetTemplateGalleryPages'],
    awaitRefetchQueries: true,
    ...options
  })
}
