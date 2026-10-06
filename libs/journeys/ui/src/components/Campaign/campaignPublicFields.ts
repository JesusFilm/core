import { gql } from '@apollo/client'

/**
 * Every Campaign Block field the public page reads, as one flat-list item.
 * The three per-type `variant` fields are aliased because they return
 * different enums and GraphQL forbids one response name with two shapes.
 * A Campaign Video's Watch titles read the enclosing query's `$languageId`
 * (the Page Language), so every operation spreading this fragment declares it.
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
      title
      lede
      align
      mediaBlockId
    }
    ... on CampaignRegionSwitcherBlock {
      title
      switcherVariant: variant
    }
    ... on CampaignVideoCarouselBlock {
      eyebrow
      title
      videoId
      videoVariantLanguageId
      video {
        __typename
        id
        slug
        childrenCount
        title(languageId: $languageId, primary: true) {
          value
          primary
          language {
            id
          }
        }
        images(aspectRatio: banner) {
          mobileCinematicHigh
        }
        children {
          __typename
          id
          slug
          title(languageId: $languageId, primary: true) {
            value
            primary
            language {
              id
            }
          }
          variant {
            id
            slug
            duration
          }
          images(aspectRatio: banner) {
            mobileCinematicHigh
          }
        }
      }
    }
    ... on CampaignJourneyListBlock {
      eyebrow
      title
      lede
      display
    }
    ... on CampaignAnalyticsBlock {
      eyebrow
      title
      showMap
    }
    ... on CampaignRegionHeaderBlock {
      intro
    }
    ... on CampaignRegionShareBlock {
      title
      intro
    }
    ... on CampaignHeaderBlock {
      logoBlockId
    }
    ... on CampaignFeaturedMediaBlock {
      eyebrow
      title
      lede
      bullets
      mediaSide
      mediaBlockId
    }
    ... on CampaignVideoBlock {
      source
      videoId
      videoVariantLanguageId
      title
      description
      image
      duration
      mediaVideo {
        __typename
        ... on Video {
          id
          label
          slug
          childrenCount
          title(languageId: $languageId, primary: true) {
            value
            primary
            language {
              id
            }
          }
          images(aspectRatio: banner) {
            mobileCinematicHigh
          }
          variant {
            id
            hls
            duration
            slug
          }
        }
        ... on MuxVideo {
          id
          playbackId
        }
        ... on YouTube {
          id
        }
      }
    }
    ... on CampaignImageBlock {
      src
      alt
      width
      height
    }
    ... on CampaignTypographyBlock {
      content
      typographyVariant: variant
      align
      color
      placement
    }
    ... on CampaignButtonBlock {
      label
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
