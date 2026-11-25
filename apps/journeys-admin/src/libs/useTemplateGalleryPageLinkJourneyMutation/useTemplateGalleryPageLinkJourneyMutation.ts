import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  TemplateGalleryPageLinkJourney,
  TemplateGalleryPageLinkJourneyVariables
} from '../../../__generated__/TemplateGalleryPageLinkJourney'

// Adds a template to a collection without removing it from any other. The
// server decides the row's role: home when the template has none, otherwise
// a link. Returns the target page with its `memberships` so the gallery
// can draw the new card as a link (or home) straight from the cache.
export const TEMPLATE_GALLERY_PAGE_LINK_JOURNEY = gql`
  mutation TemplateGalleryPageLinkJourney($journeyId: ID!, $pageId: ID!) {
    templateGalleryPageLinkJourney(journeyId: $journeyId, pageId: $pageId) {
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

export function useTemplateGalleryPageLinkJourneyMutation(
  options?: useMutation.Options<
    TemplateGalleryPageLinkJourney,
    TemplateGalleryPageLinkJourneyVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPageLinkJourney,
  TemplateGalleryPageLinkJourneyVariables
> {
  return useMutation<
    TemplateGalleryPageLinkJourney,
    TemplateGalleryPageLinkJourneyVariables
  >(TEMPLATE_GALLERY_PAGE_LINK_JOURNEY, options)
}
