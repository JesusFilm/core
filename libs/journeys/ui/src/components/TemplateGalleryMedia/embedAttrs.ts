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

/**
 * The hosts this module renders with host-tuned iframe attributes. Used as
 * the fail-safe default allowlist when no env-driven list is supplied (see
 * `isEmbedUrlAllowed`) — so the public page never renders fewer providers
 * than it tunes, and an env list strictly extends this set.
 */
export const KNOWN_EMBED_HOSTS: ReadonlySet<string> = new Set([
  ...YOUTUBE_HOSTS,
  ...CANVA_HOSTS,
  ...SLIDES_HOSTS
])

/**
 * Parses `embedUrl` and returns its lowercased hostname, but ONLY for https
 * URLs. Returns null for any non-https scheme (`javascript:`, `data:`,
 * `http:`) or an unparseable string — the caller renders nothing in that
 * case. This is the protocol half of the defense-in-depth gate; an iframe
 * `src` is the one place a `javascript:` URL would execute in the embedding
 * origin, so it must never reach the DOM.
 */
function parseHttpsHost(embedUrl: string): string | null {
  let url: URL
  try {
    url = new URL(embedUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  return url.hostname.toLowerCase()
}

/**
 * Returns the iframe attributes for the given embed URL, keyed on its host —
 * or `null` when the URL is not a renderable https URL, in which case the
 * caller (`EmbedIframe`) renders nothing. Known hosts get host-tuned
 * attributes; any other https host gets the most-restrictive safe default
 * (notably WITHOUT `allow-same-origin`, so an untuned third-party embed runs
 * script-isolated in an opaque origin).
 */
export function embedAttrs(embedUrl: string): EmbedIframeAttrs | null {
  const host = parseHttpsHost(embedUrl)
  if (host == null) return null

  if (YOUTUBE_HOSTS.has(host)) {
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

  if (CANVA_HOSTS.has(host)) {
    return {
      allow: 'fullscreen',
      allowFullScreen: true,
      sandbox:
        'allow-scripts allow-same-origin allow-forms allow-popups allow-fullscreen',
      aspectRatioPaddingTop: RATIO_CANVA
    }
  }

  if (SLIDES_HOSTS.has(host)) {
    return {
      allow: 'fullscreen',
      allowFullScreen: true,
      sandbox: 'allow-scripts allow-same-origin allow-popups allow-fullscreen',
      aspectRatioPaddingTop: RATIO_CANVA
    }
  }

  // Unknown (but https) host: most-restrictive safe default. No
  // `allow-same-origin` — combined with `allow-scripts` it would let the
  // frame script the embedding origin; an untuned embed runs in an opaque
  // origin instead. Hosts added via the env allowlist render here until/unless
  // a host-tuned branch is added above.
  return {
    allow: '',
    allowFullScreen: false,
    sandbox: 'allow-scripts',
    aspectRatioPaddingTop: RATIO_16_9
  }
}
