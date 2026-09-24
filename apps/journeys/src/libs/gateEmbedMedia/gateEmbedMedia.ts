import {
  isEmbedUrlAllowed,
  resolveEmbedHosts
} from '@core/journeys/ui/TemplateGalleryMedia'

import { TemplateGalleryPageMediaType } from '../../../__generated__/globalTypes'

interface EmbedMedia {
  type: TemplateGalleryPageMediaType
  embedUrl: string | null
}

/**
 * Defense-in-depth at the read boundary: drop a `link` media whose
 * server-normalized `embedUrl` is not a https URL on the embed-host
 * allowlist, so an off-allowlist URL never reaches the client iframe even if
 * the API's save-time normalizer regresses. The allowlist is the same
 * `TEMPLATE_LIBRARY_EMBED_HOSTS` Doppler secret the API uses, read server-side
 * (no `NEXT_PUBLIC_`) so a Doppler change applies at runtime. `mux` media
 * carries no URL and passes through.
 */
export function gateEmbedMedia<T extends EmbedMedia>(
  media: T | null
): T | null {
  if (media == null || media.type !== TemplateGalleryPageMediaType.link) {
    return media
  }
  const allowedHosts = resolveEmbedHosts(
    process.env.TEMPLATE_LIBRARY_EMBED_HOSTS
  )
  if (
    media.embedUrl != null &&
    isEmbedUrlAllowed(media.embedUrl, allowedHosts)
  ) {
    return media
  }
  return null
}
