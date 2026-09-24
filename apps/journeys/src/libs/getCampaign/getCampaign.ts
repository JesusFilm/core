import { gql } from '@apollo/client'

// Public query for the campaign landing page. Single round-trip: campaign
// metadata + both ordered journey lists (already filtered to same-team,
// published rows server-side) + the server-aggregated country stats. The
// stats field is independent of the campaign field so a Plausible failure
// (errorPolicy: 'all') still renders the page with an "unavailable" panel.
export const GET_CAMPAIGN = gql`
  query GetCampaign($slug: String!) {
    campaignBySlug(slug: $slug) {
      id
      slug
      title
      eyebrow
      tagline
      description
      backgroundImageSrc
      backgroundImageAlt
      publishedAt
      media {
        id
        type
        embedUrl
        muxPlaybackId
      }
      shareJourneys {
        id
        title
        slug
        language {
          id
          bcp47
          name(languageId: "529", primary: true) {
            value
            primary
          }
        }
      }
      templateJourneys {
        id
        title
        description
        slug
        createdAt
        template
        customizable
        website
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
          width
          height
          blurhash
        }
      }
    }
    campaignCountryStats(slug: $slug) {
      from
      to
      totalVisitors
      totalPageviews
      countries {
        countryCode
        countryName
        visitors
        pageviews
      }
    }
  }
`
