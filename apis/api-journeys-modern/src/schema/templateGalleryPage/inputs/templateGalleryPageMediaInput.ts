import { builder } from '../../builder'
import { TemplateGalleryPageMediaType } from '../enums'

// Tagged-union input. The resolver enforces per-type field requirements with a
// zod discriminated union on `type` (no Pothos @oneOf plugin in this subgraph):
//   - type=link → `url` required, `muxVideoId` must be absent
//   - type=mux  → `muxVideoId` required, `url` must be absent
export const TemplateGalleryPageMediaInput = builder.inputType(
  'TemplateGalleryPageMediaInput',
  {
    description:
      'Discriminated input for attaching media to a TemplateGalleryPage. When `type` is `link`, supply `url` (server-validated and normalized per provider). When `type` is `mux`, supply `muxVideoId` (validated against the media DB).',
    fields: (t) => ({
      type: t.field({
        type: TemplateGalleryPageMediaType,
        required: true,
        description: 'Discriminator selecting which other field is required.'
      }),
      url: t.string({
        required: false,
        description:
          'The pasted embed URL. Required when `type` is `link`; must be omitted when `type` is `mux`. Provider verification varies: Canva and YouTube are confirmed via oEmbed, but Google Slides is shape-validated only (a published-shaped URL that is actually private or non-existent passes validation), so a stored Google Slides embed is not guaranteed to render.'
      }),
      muxVideoId: t.id({
        required: false,
        description:
          'The Mux video id to attach. Required when `type` is `mux`; must be omitted when `type` is `link`.'
      })
    })
  }
)
