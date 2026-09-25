import { gql } from '@apollo/client'

// Every campaign read and mutation selects this same fragment so Apollo's
// normalized `Campaign:<id>` entry is updated consistently by the list, the
// builder and each mutation response.
export const CAMPAIGN_FIELDS = gql`
  fragment CampaignJourneyItemFields on CampaignJourneyItem {
    id
    title
    description
    slug
    status
    createdAt
    customizable
    language {
      id
      bcp47
      name {
        value
        primary
      }
    }
    primaryImageBlock {
      id
      src
      alt
    }
  }

  fragment CampaignFields on Campaign {
    id
    title
    slug
    eyebrow
    tagline
    description
    backgroundImageSrc
    backgroundImageAlt
    status
    publishedAt
    statsFrom
    createdAt
    updatedAt
    team {
      id
    }
    media {
      id
      type
      muxVideoId
      embedUrl
      muxPlaybackId
      muxName
      muxDuration
    }
    shareJourneys {
      ...CampaignJourneyItemFields
    }
    templateJourneys {
      ...CampaignJourneyItemFields
    }
  }
`
