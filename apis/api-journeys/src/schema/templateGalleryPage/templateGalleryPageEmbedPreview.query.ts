import { builder } from '../builder'

import { linkValidate } from './media/linkValidate'

// Read-only resolve-preview for the collection media LINK field. Runs the exact
// same validation + normalization as the save path (linkValidate) so the editor
// can show the resolved embed — or a tailored error — BEFORE saving, without
// persisting anything. No new normalization logic lives here; it is a thin
// wrapper so preview and save can never diverge.
//
// Auth: isAuthenticated. linkValidate performs server-side fetches (provider
// oEmbed calls, canva.link redirect following), so this is an SSRF-shaped
// surface. Two bounds keep it safe: the env-owned allowlist
// (TEMPLATE_LIBRARY_EMBED_HOSTS) rejects any non-approved host with
// EMBED_HOST_NOT_ALLOWED *before* any network call, and gating on
// isAuthenticated keeps it off the anonymous PublicContext surface. Read-only:
// no DB access, no team data touched (the URL is not tied to a team).
//
// Errors mirror the save path exactly (same GraphQLError reason codes), so the
// editor's preview and save error handling are identical:
//   - BAD_USER_INPUT (field: url): the URL is not https
//   - BAD_USER_INPUT / EMBED_HOST_NOT_ALLOWED: host not in the allowlist
//   - BAD_USER_INPUT / CANVA_UNAVAILABLE | GOOGLE_SLIDES_NOT_PUBLISHED | … :
//     provider-specific normalization failed
builder.queryField('templateGalleryPageEmbedPreview', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'String',
    nullable: false,
    description:
      'Resolve a pasted embed URL to its normalized iframe `embedUrl` without saving — for the collection media link-field preview. Runs the same validation and normalization as the create/update `media` link path (https check, host allowlist, provider normalization for Canva/YouTube/Google Slides). Authenticated callers only.\n\nErrors (same reason codes as the save path):\n- BAD_USER_INPUT (field: `url`): URL is not https.\n- BAD_USER_INPUT / EMBED_HOST_NOT_ALLOWED: host is not in the embed allowlist.\n- BAD_USER_INPUT / CANVA_UNAVAILABLE, GOOGLE_SLIDES_NOT_PUBLISHED, etc.: provider normalization failed.',
    args: {
      url: t.arg.string({
        required: true,
        description:
          'The pasted embed URL to validate and normalize. Must be https and on an allowlisted host; provider URLs (Canva, YouTube, Google Slides) are normalized to their iframe form, and a canva.link short link is resolved to its design URL.'
      })
    },
    resolve: async (_parent, args) => {
      const { embedUrl } = await linkValidate(args.url)
      return embedUrl
    }
  })
)
