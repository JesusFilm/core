import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  TemplateGalleryPageMoveJourney,
  TemplateGalleryPageMoveJourneyVariables
} from '../../../__generated__/TemplateGalleryPageMoveJourney'

// Relocates one membership between collections; the row keeps its home /
// link role. Returns every page that changed (source, destination, and a
// promoted page when the source held a home that is now on the
// destination) so Apollo's normalized merge updates all of them at once.
export const TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY = gql`
  mutation TemplateGalleryPageMoveJourney(
    $journeyId: ID!
    $fromPageId: ID!
    $toPageId: ID!
  ) {
    templateGalleryPageMoveJourney(
      journeyId: $journeyId
      fromPageId: $fromPageId
      toPageId: $toPageId
    ) {
      id
      title
      description
      slug
      status
      creatorName
      creatorImageSrc
      creatorImageAlt
      media {
        id
        type
        muxVideoId
        embedUrl
        muxPlaybackId
        muxName
        muxDuration
      }
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
      memberships {
        journeyId
        isHome
      }
    }
  }
`

export function useTemplateGalleryPageMoveJourneyMutation(
  options?: useMutation.Options<
    TemplateGalleryPageMoveJourney,
    TemplateGalleryPageMoveJourneyVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPageMoveJourney,
  TemplateGalleryPageMoveJourneyVariables
> {
  return useMutation<
    TemplateGalleryPageMoveJourney,
    TemplateGalleryPageMoveJourneyVariables
  >(TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY, options)
}
