import { gql } from '@apollo/client'

/**
 * Every Campaign Block field the public page reads, as one flat-list item.
 * The three per-type `variant` fields are aliased because they return
 * different enums and GraphQL forbids one response name with two shapes.
 */
export const CAMPAIGN_PUBLIC_BLOCK_FIELDS = gql`
  fragment CampaignPublicBlockFields on CampaignBlock {
    __typename
    id
    campaignId
    pageId
    regionId
    parentBlockId
    parentOrder
    ... on CampaignSectionBlock {
      backgroundKind
      backgroundColor
      coverBlockId
      backgroundOverlay
      headingColor
      textColor
      buttonColor
      buttonTextColor
      accentColor
    }
    ... on CampaignHeroBlock {
      eyebrow
      eyebrowTranslations {
        languageId
        value
      }
      title
      titleTranslations {
        languageId
        value
      }
      lede
      ledeTranslations {
        languageId
        value
      }
      align
      mediaBlockId
    }
    ... on CampaignRegionSwitcherBlock {
      title
      titleTranslations {
        languageId
        value
      }
      switcherVariant: variant
    }
    ... on CampaignVideoCarouselBlock {
      eyebrow
      eyebrowTranslations {
        languageId
        value
      }
      title
      titleTranslations {
        languageId
        value
      }
      videoId
      videoVariantLanguageId
    }
    ... on CampaignJourneyListBlock {
      eyebrow
      eyebrowTranslations {
        languageId
        value
      }
      title
      titleTranslations {
        languageId
        value
      }
      lede
      ledeTranslations {
        languageId
        value
      }
      display
    }
    ... on CampaignAnalyticsBlock {
      eyebrow
      eyebrowTranslations {
        languageId
        value
      }
      title
      titleTranslations {
        languageId
        value
      }
      showMap
    }
    ... on CampaignRegionHeaderBlock {
      intro
      introTranslations {
        languageId
        value
      }
    }
    ... on CampaignRegionShareBlock {
      title
      titleTranslations {
        languageId
        value
      }
      intro
      introTranslations {
        languageId
        value
      }
    }
    ... on CampaignHeaderBlock {
      logoBlockId
    }
    ... on CampaignTypographyBlock {
      content
      contentTranslations {
        languageId
        value
      }
      typographyVariant: variant
      align
      color
      placement
    }
    ... on CampaignButtonBlock {
      label
      labelTranslations {
        languageId
        value
      }
      buttonVariant: variant
      size
      align
      color
      labelColor
      placement
      action {
        __typename
        parentBlockId
        ... on CampaignLinkAction {
          url
          target
        }
        ... on CampaignScrollToBlockAction {
          blockId
        }
        ... on CampaignNavigateToRegionAction {
          regionId
        }
      }
    }
  }
`

/**
 * The one page query's payload: a published campaign with every text field
 * already resolved to the Page Language, both pages' blocks and the chrome as
 * flat lists, and each region with its Share Languages and resolved URLs.
 */
export const CAMPAIGN_PUBLIC_FIELDS = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  fragment CampaignPublicFields on CampaignPublic {
    __typename
    id
    teamId
    slug
    title
    defaultLanguageId
    languageId
    publishedAt
    language {
      id
      bcp47
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
    strings {
      id
      key
      value
    }
    regions {
      id
      slug
      name
      listed
      order
      countries {
        id
        countryId
        order
      }
      languages {
        id
        languageId
        order
        journeyStatus
        journeyUrl
        embedUrl
        language {
          id
          bcp47
          name(primary: true) {
            value
            primary
          }
        }
      }
      lines {
        ...CampaignPublicBlockFields
      }
    }
    header {
      ...CampaignPublicBlockFields
    }
    footer {
      ...CampaignPublicBlockFields
    }
    chrome {
      ...CampaignPublicBlockFields
    }
    pages {
      id
      kind
      blocks {
        ...CampaignPublicBlockFields
      }
    }
  }
`
