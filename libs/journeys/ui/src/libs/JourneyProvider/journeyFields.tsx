import { gql } from '@apollo/client'

import { IMAGE_FIELDS } from '../../components/Image/imageFields'
import { BLOCK_FIELDS } from '../block/blockFields'

/**
 * Return only common fields needed by journeys and journeys-admin.
 * Project-specific fields should be added in a project-specific
 * useJourneyQuery/useJourneysQuery hook.
 */
export const JOURNEY_FIELDS = gql`
  ${BLOCK_FIELDS}
  ${IMAGE_FIELDS}
  fragment JourneyFields on Journey {
    id
    slug
    title
    description
    status
    language {
      id
      bcp47
      iso3
      name {
        value
        primary
      }
    }
    createdAt
    featuredAt
    publishedAt
    themeName
    themeMode
    strategySlug
    seoTitle
    seoDescription
    template
    blocks {
      ...BlockFields
    }
    primaryImageBlock {
      ...ImageFields
    }
    creatorDescription
    creatorImageBlock {
      ...ImageFields
    }
    userJourneys {
      id
      role
      openedAt
      user {
        id
        firstName
        lastName
        imageUrl
      }
    }
    chatButtons {
      id
      link
      platform
    }
    host {
      id
      teamId
      title
      location
      src1
      src2
    }
    team {
      id
      title
      publicTitle
    }
    tags {
      id
      parentId
      name {
        value
        language {
          id
        }
        primary
      }
    }
  }
`
