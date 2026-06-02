import { GraphQLError } from 'graphql'

import { assertHttpsUrl } from '../assertHttpsUrl'

import { EmbedNormalizerSpec } from './types'

// Public oEmbed endpoint — no API key. The old www.canva.com/_oembed endpoint
// was EOL'd 30 Jun 2024; do not use it.
const CANVA_OEMBED_ENDPOINT = 'https://api.canva.com/_spi/presentation/_oembed'
const FETCH_TIMEOUT_MS = 5000

// Canonical design URL shape that is safe to rewrite without oEmbed
// confirmation: /design/{id}/{slug}/(edit|view|watch).
const CANONICAL_DESIGN_PATH =
  /^\/design\/([^/]+)\/([^/]+)\/(?:edit|view|watch)\/?$/

function canvaUnavailable(): GraphQLError {
  return new GraphQLError(
    'Canva embed could not be verified for this URL. Open the design, use Share → "More" → embed, and paste a design link of the form canva.com/design/<id>/<slug>/view.',
    { extensions: { code: 'BAD_USER_INPUT', reason: 'CANVA_UNAVAILABLE' } }
  )
}

function extractIframeSrc(html: string | undefined): string | null {
  if (html == null) return null
  const match = /<iframe[^>]*\ssrc=["']([^"']+)["']/i.exec(html)
  return match?.[1] ?? null
}

/**
 * Calls Canva's oEmbed endpoint and returns the iframe `src` it advertises, or
 * `null` on any failure (timeout, non-2xx, parse error, no iframe). Failures
 * are intentionally swallowed here so the caller can decide whether the URL is
 * eligible for the constrained regex fallback.
 */
async function fetchOEmbedSrc(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(
      `${CANVA_OEMBED_ENDPOINT}?url=${encodeURIComponent(url)}`,
      { signal: controller.signal }
    )
    if (!response.ok) return null
    const data: unknown = await response.json()
    const html =
      typeof data === 'object' &&
      data !== null &&
      'html' in data &&
      typeof (data as { html: unknown }).html === 'string'
        ? (data as { html: string }).html
        : undefined
    return extractIframeSrc(html)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// Fail-closed fallback: only rewrite URLs that already match the canonical
// design shape. Anything else rejects rather than silently persisting an
// unverified URL that renders a broken iframe (the NES-1660 failure mode).
function canvaRegexFallback(url: string): { embedUrl: string } {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw canvaUnavailable()
  }
  const match = CANONICAL_DESIGN_PATH.exec(parsed.pathname)
  if (match == null) throw canvaUnavailable()
  const [, designId, slug] = match
  return {
    embedUrl: `https://${parsed.hostname}/design/${designId}/${slug}/view?embed`
  }
}

async function normalize(url: string): Promise<{ embedUrl: string }> {
  const src = await fetchOEmbedSrc(url)
  if (src != null) {
    // Re-validate the URL Canva handed us through the same https guard applied
    // to user input — closes a `javascript:`/`data:` injection vector if the
    // oEmbed response is ever poisoned. This throws hard; it must NOT fall
    // through to the regex fallback.
    //
    // Trust boundary: the returned `src` host is NOT re-checked against the
    // allowlist — only https is enforced here. We trust Canva's own oEmbed
    // endpoint to return a Canva-hosted iframe URL, so the src host is
    // unconstrained beyond the https scheme.
    assertHttpsUrl(src, 'url')
    return { embedUrl: src }
  }
  return canvaRegexFallback(url)
}

export const canvaSpec: EmbedNormalizerSpec = {
  hosts: ['canva.com', 'www.canva.com'],
  normalize
}
