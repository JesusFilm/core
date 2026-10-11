import { gql } from '@apollo/client'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

export const TRANSLATED_VALUE_FIELDS = gql`
  fragment TranslatedValueFields on TranslatedValue {
    languageId
    value
    source
  }
`

/**
 * The translation list beside every text field of a campaign block: what the
 * canvas shows while previewing a non-default language and what
 * `campaignTranslationSet` updates. Admin only; the public read omits them.
 */
export const CAMPAIGN_BLOCK_TRANSLATION_FIELDS = gql`
  ${TRANSLATED_VALUE_FIELDS}
  fragment CampaignBlockTranslationFields on CampaignBlock {
    ... on CampaignHeroBlock {
      eyebrowTranslations {
        ...TranslatedValueFields
      }
      titleTranslations {
        ...TranslatedValueFields
      }
      ledeTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignRegionSwitcherBlock {
      titleTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignVideoCarouselBlock {
      eyebrowTranslations {
        ...TranslatedValueFields
      }
      titleTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignJourneyListBlock {
      eyebrowTranslations {
        ...TranslatedValueFields
      }
      titleTranslations {
        ...TranslatedValueFields
      }
      ledeTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignAnalyticsBlock {
      eyebrowTranslations {
        ...TranslatedValueFields
      }
      titleTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignRegionHeaderBlock {
      introTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignRegionShareBlock {
      titleTranslations {
        ...TranslatedValueFields
      }
      introTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignTypographyBlock {
      contentTranslations {
        ...TranslatedValueFields
      }
    }
    ... on CampaignButtonBlock {
      labelTranslations {
        ...TranslatedValueFields
      }
    }
  }
`

/**
 * A Campaign Region as the editor reads it: its settings and its country
 * chips, each chip carrying the federated api-languages Country for the flag
 * and name. Lines are not here: they are rows of `Campaign.blocks` with
 * `regionId` set.
 */
export const CAMPAIGN_REGION_FIELDS = gql`
  fragment CampaignRegionFields on CampaignRegion {
    __typename
    id
    campaignId
    name
    slug
    order
    listed
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
 * roles that decide Manage and Delete, the languages for the preview select
 * and the Languages panel (autonym plus the English name),
 * the theme, both pages, every live block as one flat list (the block
 * fields are the ones the public page reads, shared with the viewer, plus
 * each text field's translations) and the seventeen Campaign Strings.
 */
export const CAMPAIGN_FIELDS = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_REGION_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  fragment CampaignFields on Campaign {
    __typename
    id
    teamId
    title
    titleTranslations {
      ...TranslatedValueFields
    }
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
        name(languageId: "529", primary: true) {
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
      ...CampaignRegionFields
    }
    strings {
      id
      key
      value
      valueTranslations {
        ...TranslatedValueFields
      }
    }
  }
`
