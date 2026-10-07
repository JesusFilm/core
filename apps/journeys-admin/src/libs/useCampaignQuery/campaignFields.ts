import { gql } from '@apollo/client'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

/**
 * Every text field's per-language values, for the canvas preview language.
 * Admin only: the public page receives its text already resolved to the Page
 * Language, so it must not download every language's copy.
 */
export const CAMPAIGN_BLOCK_TRANSLATION_FIELDS = gql`
  fragment CampaignBlockTranslationFields on CampaignBlock {
    __typename
    id
    ... on CampaignHeroBlock {
      eyebrowTranslations {
        languageId
        value
      }
      titleTranslations {
        languageId
        value
      }
      ledeTranslations {
        languageId
        value
      }
    }
    ... on CampaignRegionSwitcherBlock {
      titleTranslations {
        languageId
        value
      }
    }
    ... on CampaignVideoCarouselBlock {
      eyebrowTranslations {
        languageId
        value
      }
      titleTranslations {
        languageId
        value
      }
    }
    ... on CampaignJourneyListBlock {
      eyebrowTranslations {
        languageId
        value
      }
      titleTranslations {
        languageId
        value
      }
      ledeTranslations {
        languageId
        value
      }
    }
    ... on CampaignAnalyticsBlock {
      eyebrowTranslations {
        languageId
        value
      }
      titleTranslations {
        languageId
        value
      }
    }
    ... on CampaignRegionHeaderBlock {
      introTranslations {
        languageId
        value
      }
    }
    ... on CampaignRegionShareBlock {
      titleTranslations {
        languageId
        value
      }
      introTranslations {
        languageId
        value
      }
    }
    ... on CampaignTypographyBlock {
      contentTranslations {
        languageId
        value
      }
    }
    ... on CampaignButtonBlock {
      labelTranslations {
        languageId
        value
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
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
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
      ...CampaignBlockTranslationFields
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
