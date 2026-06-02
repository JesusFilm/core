import { builder } from '../builder'

import { TemplateGalleryPageMediaType } from './enums'

// Public-anonymous-reachable type: `TemplateGalleryPage.media` is served on the
// unauthenticated `templateGalleryPageBySlug` path (NES-1547). Every field here
// sources DIRECTLY from the Prisma row — there is no cross-DB resolve at read
// time, no federated `MuxVideo` ref (cross-subgraph auth is unreliable for
// public paths), and no `embedHtml` (the frontend templates the iframe itself).
//
// Deliberately NOT exposed:
//   - `muxVideoId` — the raw FK is internal-only.
//   - any federated MuxVideo relation — public reads must not cross to media DB.
// The negative-selection spec guards these omissions; do not add them without
// re-running the public-context exposure audit.
export const TemplateGalleryPageMediaRef = builder.prismaObject(
  'TemplateGalleryPageMedia',
  {
    description:
      'Media attached to a TemplateGalleryPage. `type` discriminates the populated fields: `link` populates `embedUrl`; `mux` populates `muxPlaybackId`. All fields source directly from the stored row so public-page reads never cross to the media database.',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      type: t.expose('type', {
        type: TemplateGalleryPageMediaType,
        nullable: false,
        description: 'Discriminator for which underlying field is populated.'
      }),
      embedUrl: t.exposeString('embedUrl', {
        nullable: true,
        description:
          'Server-normalized iframe URL. Populated for `link`; null for `mux`.'
      }),
      muxPlaybackId: t.exposeString('muxPlaybackId', {
        nullable: true,
        description:
          'Mux playback ID, denormalized from MuxVideo at save time so public reads never cross to the media DB. Populated for `mux`; null for `link`.'
      })
    })
  }
)
