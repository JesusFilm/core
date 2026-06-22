import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  TemplateGalleryPageEmbedPreview,
  TemplateGalleryPageEmbedPreviewVariables
} from '../../../__generated__/TemplateGalleryPageEmbedPreview'

export const TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW = gql`
  query TemplateGalleryPageEmbedPreview($url: String!) {
    templateGalleryPageEmbedPreview(url: $url)
  }
`

/**
 * Resolves a pasted media link to its normalized iframe `embedUrl` on the
 * server, running the exact same validation + normalization as the save path
 * (`linkValidate`) — so the live preview can never diverge from what a save
 * would persist, and provider errors (private YouTube, unavailable Canva,
 * unpublished Slides, disallowed host) surface inline before the user saves.
 *
 * Skipped (no network) unless `url` is a non-empty https URL: a half-typed or
 * non-https value shouldn't fire a request or surface an error — it just stays
 * a "paste a link" placeholder. Apollo caches by `url`, so re-typing a value
 * already resolved is served from cache.
 */
export function useTemplateGalleryPageEmbedPreview(
  url: string
): QueryResult<
  TemplateGalleryPageEmbedPreview,
  TemplateGalleryPageEmbedPreviewVariables
> {
  const trimmed = url.trim()
  return useQuery<
    TemplateGalleryPageEmbedPreview,
    TemplateGalleryPageEmbedPreviewVariables
  >(TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW, {
    variables: { url: trimmed },
    skip: trimmed === '' || !/^https:\/\//i.test(trimmed)
  })
}
