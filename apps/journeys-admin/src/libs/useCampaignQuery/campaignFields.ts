import { gql } from '@apollo/client'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

/**
 * The admin shape of a Campaign the editor opens with: settings, the team
 * roles that decide Manage and Delete, the languages for the preview select,
 * the theme, both pages and every live block as one flat list (the block
 * fields are the ones the public page reads, shared with the viewer).
 */
export const CAMPAIGN_FIELDS = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  fragment CampaignFields on Campaign {
    __typename
    id
    teamId
    title
    slug
    status
    defaultLanguageId
    publishedAt
    palette
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
      id
      name
      slug
      order
      listed
    }
  }
`
