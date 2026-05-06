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
    // moves, the call site adds an `update` callback that trims the moving
    // journey out of the SOURCE page's cached `templates` list, so both
    // ends of the move stay in sync without refetching. We still refetch
    // in the background so anything outside the templates field
    // eventually reconciles, but we don't await it — the user already
    // saw the optimistic update.
    refetchQueries: ['GetTemplateGalleryPages'],
    ...options
  })
}
