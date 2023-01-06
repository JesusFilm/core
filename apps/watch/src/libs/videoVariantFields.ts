import { gql } from '@apollo/client'

export const VIDEO_VARIANT_FIELDS = gql`
  fragment VideoVariantFields on Video {
    id
    variantLanguagesWithSlug {
      slug
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`
