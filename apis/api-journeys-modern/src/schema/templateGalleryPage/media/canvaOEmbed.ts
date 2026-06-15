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

// Canva's short share-link host (e.g. https://canva.link/0fi14tc9momlpe8). It
// is not a design URL the oEmbed endpoint or the canonical-path fallback can
// read directly, so it is resolved to its underlying canva.com/design/... URL
// first (see resolveShareLink).
const CANVA_LINK_HOST = 'canva.link'
const CANVA_DESIGN_HOSTS = new Set(['canva.com', 'www.canva.com'])

// Defense-in-depth host pin for the oEmbed-returned iframe src. Suffix match on
// canva.com (rather than the exact CANVA_DESIGN_HOSTS set) so legitimate Canva
// subdomains/CDN hosts still pass, while a poisoned oEmbed response pointing at
// a foreign host is rejected.
function isCanvaHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === 'canva.com' || host.endsWith('.canva.com')
}

// Redirect hops resolveShareLink will follow before failing closed. canva.link
// resolves in 1-2 hops in practice; the cap exists so a hostile chain can't
// chew through Node's default ~20 follows.
const MAX_REDIRECTS = 5
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

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

// One redirect hop with its own 5s timeout, so total wall time is bounded by
// (MAX_REDIRECTS + 1) * FETCH_TIMEOUT_MS rather than drifting on a shared timer.
async function fetchHop(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, {
      redirect: 'manual',
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }
}

// Resolves a canva.link short share link to its underlying canva.com design
// URL by following HTTP redirects manually (capped at MAX_REDIRECTS). The
// design URL is taken straight from the redirect `location` header the moment a
// hop points at a Canva design host — the destination is NOT fetched, because
// Canva returns 403 to server-side requests for design pages (re-fetching it
// would make every share link fail closed). Every intermediate hop must be
// https and stay on a Canva host (canva.link or a design host) — a chain that
// bounces through http: or a foreign host fails closed without being followed.
// Non-share hosts pass through unchanged. Fails closed (CANVA_UNAVAILABLE) when
// the link can't be resolved or resolves somewhere unexpected. The resolved
// URL is validated downstream by oEmbed + the canonical-path fallback.
async function resolveShareLink(url: string): Promise<string> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw canvaUnavailable()
  }
  if (parsed.hostname.toLowerCase() !== CANVA_LINK_HOST) return url

  let currentUrl = url
  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt++) {
    let response: Response
    try {
      response = await fetchHop(currentUrl)
    } catch {
      throw canvaUnavailable()
    }

    // A 2xx here means a canva.link URL responded without redirecting — it
    // never resolved to a design URL, so fail closed. (A design host is
    // returned straight from the redirect `location` below and is NEVER
    // fetched, so this branch only ever sees the un-redirected canva.link
    // host, which is not a design host.)
    if (response.status >= 200 && response.status < 300) {
      const finalParsed = new URL(currentUrl)
      if (
        finalParsed.protocol !== 'https:' ||
        !CANVA_DESIGN_HOSTS.has(finalParsed.hostname.toLowerCase())
      ) {
        throw canvaUnavailable()
      }
      return currentUrl
    }

    if (!REDIRECT_STATUSES.has(response.status)) throw canvaUnavailable()
    const location = response.headers.get('location')
    if (location == null) throw canvaUnavailable()

    let next: URL
    try {
      next = new URL(location, currentUrl)
    } catch {
      throw canvaUnavailable()
    }
    const nextHost = next.hostname.toLowerCase()
    if (
      next.protocol !== 'https:' ||
      (nextHost !== CANVA_LINK_HOST && !CANVA_DESIGN_HOSTS.has(nextHost))
    ) {
      throw canvaUnavailable()
    }
    // Resolved: the redirect points at a Canva design host. Return it straight
    // from the `location` header WITHOUT fetching the destination — Canva
    // returns 403 to server-side requests for design pages, so re-fetching it
    // to confirm a 2xx would fail closed and break every share link. The design
    // is validated downstream by oEmbed + the canonical-path fallback.
    if (CANVA_DESIGN_HOSTS.has(nextHost)) return next.toString()
    currentUrl = next.toString()
  }

  throw canvaUnavailable()
}

async function normalize(url: string): Promise<{ embedUrl: string }> {
  const resolvedUrl = await resolveShareLink(url)
  const src = await fetchOEmbedSrc(resolvedUrl)
  if (src != null) {
    // Re-validate the URL Canva handed us through the same https guard applied
    // to user input — closes a `javascript:`/`data:` injection vector if the
    // oEmbed response is ever poisoned. This throws hard; it must NOT fall
    // through to the regex fallback.
    assertHttpsUrl(src, 'url')
    // Defense-in-depth: pin the returned host to Canva. The src is rendered in
    // a public iframe, so a poisoned/compromised oEmbed response must not be
    // able to plant an arbitrary https host on a public page. Suffix-matched on
    // canva.com so legitimate Canva subdomains pass; anything else fails closed.
    let srcParsed: URL
    try {
      srcParsed = new URL(src)
    } catch {
      throw canvaUnavailable()
    }
    if (!isCanvaHost(srcParsed.hostname)) throw canvaUnavailable()
    return { embedUrl: src }
  }
  return canvaRegexFallback(resolvedUrl)
}

export const canvaSpec: EmbedNormalizerSpec = {
  hosts: ['canva.com', 'www.canva.com', 'canva.link'],
  normalize
}
