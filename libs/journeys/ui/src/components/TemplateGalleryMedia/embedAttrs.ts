import { type HTMLAttributeReferrerPolicy } from 'react'

/**
 * The iframe attributes a given embed host needs to render safely and
 * correctly. Shared by the admin preview (apps/journeys-admin
 * CollectionPreviewPane) and the public renderer (apps/journeys
 * TemplateGalleryMedia) so the two surfaces cannot drift.
 *
 * Pure — no React rendering, no IO. The input is the server-normalized
 * `embedUrl` (Canva/YouTube/Slides oEmbed output) on the public side, or the
 * client-normalized URL on the preview side.
 */
export interface EmbedIframeAttrs {
  /** Permissions-Policy `allow` attribute value for the iframe. */
  allow: string
  /** Whether the iframe should carry `allowFullScreen`. */
  allowFullScreen: boolean
  /** `referrerPolicy` attribute; omitted when the host does not need one. */
  referrerPolicy?: HTMLAttributeReferrerPolicy
  /**
   * `sandbox` attribute token list. Always present — an iframe without a
   * sandbox runs embedded third-party content with unrestricted script,
   * popup, and top-level-navigation capabilities.
   */
  sandbox: string
  /**
   * Percentage `padding-top` for the responsive aspect-ratio wrapper box.
   * `56.25%` is 16:9; Canva/Slides use Canva's recommended `56.2225%`.
   */
  aspectRatioPaddingTop: string
}

const RATIO_16_9 = '56.25%'
const RATIO_CANVA = '56.2225%'

const YOUTUBE_HOSTS = new Set([
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
])
const CANVA_HOSTS = new Set(['canva.com', 'www.canva.com'])
const SLIDES_HOSTS = new Set(['docs.google.com'])

function parseHost(embedUrl: string): string | null {
  try {
    return new URL(embedUrl).hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Returns the iframe attributes for the given embed URL, keyed on its host.
 * Unknown or unparseable URLs fall back to the most-restrictive safe default.
 */
export function embedAttrs(embedUrl: string): EmbedIframeAttrs {
  const host = parseHost(embedUrl)

  if (host != null && YOUTUBE_HOSTS.has(host)) {
    return {
      allow:
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowFullScreen: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      sandbox:
        'allow-scripts allow-same-origin allow-popups allow-presentation allow-fullscreen',
      aspectRatioPaddingTop: RATIO_16_9
    }
  }

  if (host != null && CANVA_HOSTS.has(host)) {
    return {
      allow: 'fullscreen',
      allowFullScreen: true,
      sandbox:
        'allow-scripts allow-same-origin allow-forms allow-popups allow-fullscreen',
      aspectRatioPaddingTop: RATIO_CANVA
    }
  }

  if (host != null && SLIDES_HOSTS.has(host)) {
    return {
      allow: 'fullscreen',
      allowFullScreen: true,
      sandbox: 'allow-scripts allow-same-origin allow-popups allow-fullscreen',
      aspectRatioPaddingTop: RATIO_CANVA
    }
  }

  return {
    allow: '',
    allowFullScreen: false,
    sandbox: 'allow-scripts allow-same-origin',
    aspectRatioPaddingTop: RATIO_16_9
  }
}
