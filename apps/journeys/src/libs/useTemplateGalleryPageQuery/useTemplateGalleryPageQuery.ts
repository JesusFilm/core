import { gql } from '@apollo/client'

// Public query for the template gallery landing page. Single round-trip:
// gallery metadata + ordered templates (already filtered to template+published
// same-team rows server-side, see TemplateGalleryPage.templates resolver in
// apis/api-journeys-modern). Card shape mirrors GET_JOURNEYS so the existing
// TemplateGalleryCard renders without modification.
export const GET_TEMPLATE_GALLERY_PAGE = gql`
  query GetTemplateGalleryPage($slug: String!) {
    templateGalleryPageBySlug(slug: $slug) {
      id
      slug
      title
      description
      creatorName
      mediaUrl
      publishedAt
      creatorImageSrc
      creatorImageAlt
      templates {
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
  }
`
