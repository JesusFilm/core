import { builder } from '../builder'
import { TemplateGalleryPageMediaType } from '../templateGalleryPage/enums'

// FULL projection — authenticated, team-scoped reads and mutation returns.
// Exposes both retained payload slots and the raw `muxVideoId` so the editor
// can restore a parked link/upload. Column-for-column mirror of
// TemplateGalleryPageMedia (same enum) so the shared admin media editor and
// the shared media validation helpers apply unchanged.
export const CampaignMediaRef = builder.prismaObject('CampaignMedia', {
  description:
    'Authenticated media projection for the campaign editor. Exposes the full row, including both retained payload slots and the raw `muxVideoId`, so a parked link/upload can be restored. Returned only by authenticated, team-scoped read paths.',
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
      description: 'Video name denormalized at save time. Tracks `muxVideoId`.'
    }),
    muxDuration: t.exposeInt('muxDuration', {
      nullable: true,
      description:
        'Video duration in seconds denormalized at save time. Tracks `muxVideoId`.'
    })
  })
})

// PUBLIC projection — reachable on the unauthenticated `campaignBySlug` path.
// Exposes ONLY the payload selected by `type`; the parked slot and the raw
// `muxVideoId` are never emitted (same negative-selection contract as
// TemplateGalleryPageMediaPublic).
export const CampaignMediaPublicRef = builder.prismaObject('CampaignMedia', {
  variant: 'CampaignMediaPublic',
  description:
    'Public media attached to a Campaign. Exposes only the payload selected by `type` (`link` → `embedUrl`; `mux` → `muxPlaybackId`/`muxName`/`muxDuration`; `none` → nothing). Parked payloads are never exposed. All fields source from the stored row so public reads never cross to the media database.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    type: t.expose('type', {
      type: TemplateGalleryPageMediaType,
      nullable: false,
      description: 'Active selector for which payload renders.'
    }),
    // Computed (no `select` of their own): the parent campaign's `media` field
    // loads the full row, so these read in-memory scalars.
    embedUrl: t.string({
      nullable: true,
      resolve: (media) => (media.type === 'link' ? media.embedUrl : null),
      description:
        'Server-normalized iframe URL. Non-null only when `type` is `link`.'
    }),
    muxPlaybackId: t.string({
      nullable: true,
      resolve: (media) => (media.type === 'mux' ? media.muxPlaybackId : null),
      description: 'Mux playback ID. Non-null only when `type` is `mux`.'
    }),
    muxName: t.string({
      nullable: true,
      resolve: (media) => (media.type === 'mux' ? media.muxName : null),
      description:
        'Video name. Non-null only when `type` is `mux` and Mux has a name.'
    }),
    muxDuration: t.int({
      nullable: true,
      resolve: (media) => (media.type === 'mux' ? media.muxDuration : null),
      description:
        'Video duration in seconds. Non-null only when `type` is `mux` and Mux reports a duration.'
    })
  })
})
