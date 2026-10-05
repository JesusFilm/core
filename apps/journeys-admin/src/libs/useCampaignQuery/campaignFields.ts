import { gql } from '@apollo/client'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

/**
 * A Share Language as the editor reads it: the api-languages Language for
 * its label, the linked journey's id and live status, the snapshot, and the
 * Campaign QR Code whose short link is the Share Link.
 */
export const CAMPAIGN_REGION_LANGUAGE_FIELDS = gql`
  fragment CampaignRegionLanguageFields on CampaignRegionLanguage {
    __typename
    id
    regionId
    languageId
    journeyId
    title
    description
    qrCodeId
    order
    language {
      id
      bcp47
      name(primary: true) {
        value
        primary
      }
    }
    journey {
      id
      slug
      status
      title
      description
    }
    qrCode {
      id
      shortLink {
        id
        pathname
        domain {
          hostname
        }
      }
    }
  }
`

/**
 * A Campaign Region as the editor reads it: its settings, its Share
 * Languages in selector order and its country chips, each chip carrying the
 * federated api-languages Country for the flag and name. Lines are not here:
 * they are rows of `Campaign.blocks` with `regionId` set.
 */
export const CAMPAIGN_REGION_FIELDS = gql`
  ${CAMPAIGN_REGION_LANGUAGE_FIELDS}
  fragment CampaignRegionFields on CampaignRegion {
    __typename
    id
    campaignId
    name
    slug
    order
    listed
    languages {
      ...CampaignRegionLanguageFields
    }
    countries {
      __typename
      id
      regionId
      countryId
      order
      country {
        id
        flagPngSrc
        name(primary: true) {
          value
        }
      }
    }
  }
`

/**
 * The admin shape of a Campaign the editor opens with: settings, the team
 * roles that decide Manage and Delete, the languages for the preview select,
 * the theme, both pages and every live block as one flat list (the block
 * fields are the ones the public page reads, shared with the viewer).
 */
export const CAMPAIGN_FIELDS = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_REGION_FIELDS}
  fragment CampaignFields on Campaign {
    __typename
    id
    teamId
    title
    slug
    status
    defaultLanguageId
    publishedAt
    createdAt
    updatedAt
    team {
      id
      userTeams {
        id
        role
        user {
          id
        }
      }
    }
    languages {
      id
      languageId
      order
      language {
        id
        bcp47
        name(primary: true) {
          value
          primary
        }
      }
    }
    theme {
      id
      themeMode
      headerFont
      bodyFont
      labelFont
      primaryColor
      accentColor
      backgroundColor
      surfaceColor
      textColor
      mutedColor
      contrastBackgroundColor
      contrastTextColor
      radius
      buttonRadius
    }
    pages {
      id
      kind
    }
    blocks {
      ...CampaignPublicBlockFields
    }
    regions {
      ...CampaignRegionFields
    }
  }
`
