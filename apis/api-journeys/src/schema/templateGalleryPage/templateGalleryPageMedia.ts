import { builder } from '../builder'

import { TemplateGalleryPageMediaType } from './enums'

// FULL projection — the DEFAULT, unsuffixed `TemplateGalleryPageMedia` type.
//
// DELIBERATE NAMING INVERSION: conventionally the unsuffixed type is the public
// one and the privileged projection takes a suffix. We invert that here on
// purpose. This full projection keeps the unsuffixed `TemplateGalleryPageMedia`
// name because it is the type the production journeys-admin app already consumes;
// renaming it would change its GraphQL `__typename` (Apollo's cache key) and force
// coordinated cache-layer changes in journeys-admin plus a risky deploy-skew
// window on a prod-live feature. The restricted projection takes the *new*
// `TemplateGalleryPageMediaPublic` name instead — nothing in prod depends on its
// name yet (see below).
//
// Returned only by authenticated, team-scoped read paths (the admin reads and the
// page mutations), so exposing the full row is safe. Exposes BOTH retained payload
// slots AND the raw `muxVideoId`, so the editor can show a parked upload/link and
// let the user switch back to it without re-entering it.
export const TemplateGalleryPageMediaRef = builder.prismaObject(
  'TemplateGalleryPageMedia',
  {
    description:
      'Authenticated media projection for the editor. Exposes the full row, including both retained payload slots and the raw `muxVideoId`, so a parked link/upload can be restored. Returned only by authenticated, team-scoped read paths.',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      type: t.expose('type', {
        type: TemplateGalleryPageMediaType,
        nullable: false,
        description: 'Active selector for which payload renders.'
      }),
      embedUrl: t.exposeString('embedUrl', {
        nullable: true,
        description:
          'The stored link payload. May be retained while `type` is `mux`/`none` so the editor can offer switching back.'
      }),
      muxVideoId: t.exposeID('muxVideoId', {
        nullable: true,
        description:
          'Raw Mux video id of the stored upload payload. Authenticated-only — never exposed on the public type.'
      }),
      muxPlaybackId: t.exposeString('muxPlaybackId', {
        nullable: true,
        description:
          'Mux playback ID denormalized at save time. Tracks `muxVideoId`.'
      }),
      muxName: t.exposeString('muxName', {
        nullable: true,
        description:
          'Video name denormalized at save time. Tracks `muxVideoId`.'
      }),
      muxDuration: t.exposeInt('muxDuration', {
        nullable: true,
        description:
          'Video duration in seconds denormalized at save time. Tracks `muxVideoId`.'
      })
    })
  }
)

// PUBLIC projection — the `TemplateGalleryPageMediaPublic` variant, reachable on
// the unauthenticated `templateGalleryPageBySlug` path (NES-1547). Both payload
// slots may be populated on the row at once, but this type exposes ONLY the active
// payload (the one `type` selects). The inactive/parked payload is never emitted
// here, so a hidden upload or link can't leak to anonymous viewers.
//
// Deliberately NOT exposed:
//   - `muxVideoId` — the raw FK is internal-only (full/authenticated type only).
//   - any federated MuxVideo relation — public reads must not cross to media DB.
// The negative-selection spec guards these omissions; do not add them without
// re-running the public-context exposure audit.
export const TemplateGalleryPageMediaPublicRef = builder.prismaObject(
  'TemplateGalleryPageMedia',
  {
    variant: 'TemplateGalleryPageMediaPublic',
    description:
      'Public media attached to a TemplateGalleryPage. Exposes only the payload selected by `type` (`link` → `embedUrl`; `mux` → `muxPlaybackId`/`muxName`/`muxDuration`; `none` → nothing). Parked payloads for the non-active slot are never exposed. All fields source directly from the stored row so public-page reads never cross to the media database.',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      type: t.expose('type', {
        type: TemplateGalleryPageMediaType,
        nullable: false,
        description: 'Active selector for which payload renders.'
      }),
      // Each payload field is gated on `type` so the parked slot never leaks:
      // a row with `type: link` and a retained `muxVideoId` still reports a
      // null `muxPlaybackId` publicly, and vice versa. These are computed
      // fields with no `select` of their own — the parent `media` row is loaded
      // in full by the page's `media` field (`select: { media: true }`), so the
      // resolvers read the in-memory scalars rather than issuing a delegate
      // query (which would fail for the manually-resolved parent).
      embedUrl: t.string({
        nullable: true,
        resolve: (media) => (media.type === 'link' ? media.embedUrl : null),
        description:
          'Server-normalized iframe URL. Non-null only when `type` is `link`.'
      }),
      muxPlaybackId: t.string({
        nullable: true,
        resolve: (media) => (media.type === 'mux' ? media.muxPlaybackId : null),
        description:
          'Mux playback ID, denormalized at save time so public reads never cross to the media DB. Non-null only when `type` is `mux`.'
      }),
      muxName: t.string({
        nullable: true,
        resolve: (media) => (media.type === 'mux' ? media.muxName : null),
        description:
          'Video name, denormalized at save time. Non-null only when `type` is `mux` and Mux has a name.'
      }),
      muxDuration: t.int({
        nullable: true,
        resolve: (media) => (media.type === 'mux' ? media.muxDuration : null),
        description:
          'Video duration in seconds, denormalized at save time. Non-null only when `type` is `mux` and Mux reports a duration.'
      })
    })
  }
)
