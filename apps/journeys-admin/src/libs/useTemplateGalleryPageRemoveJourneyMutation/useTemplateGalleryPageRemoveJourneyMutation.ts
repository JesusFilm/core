import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  TemplateGalleryPageRemoveJourney,
  TemplateGalleryPageRemoveJourneyVariables
} from '../../../__generated__/TemplateGalleryPageRemoveJourney'

// Removes a template from one collection (`pageId`), or from every
// collection when `pageId` is omitted (archive / trash). Returns every page
// that changed, including the page whose link was promoted to home when
// the removed membership was the home.
export const TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY = gql`
  mutation TemplateGalleryPageRemoveJourney($journeyId: ID!, $pageId: ID) {
    templateGalleryPageRemoveJourney(journeyId: $journeyId, pageId: $pageId) {
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

export function useTemplateGalleryPageRemoveJourneyMutation(
  options?: useMutation.Options<
    TemplateGalleryPageRemoveJourney,
    TemplateGalleryPageRemoveJourneyVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPageRemoveJourney,
  TemplateGalleryPageRemoveJourneyVariables
> {
  return useMutation<
    TemplateGalleryPageRemoveJourney,
    TemplateGalleryPageRemoveJourneyVariables
  >(TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY, options)
}
