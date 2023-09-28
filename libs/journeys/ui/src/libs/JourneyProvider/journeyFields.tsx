import { gql } from '@apollo/client'

import { IMAGE_FIELDS } from '../../components/Image/imageFields'
import { BLOCK_FIELDS } from '../block/blockFields'

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
  }
`
