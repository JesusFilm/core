import { builder } from '../../builder'
import { TemplateGalleryPageMediaType } from '../enums'

// Both payload slots are retained; `type` is the active selector. The only hard
// requirement is a valid `type` — there is no mutual-exclusion check, so picking
// `link` with no link simply renders nothing. Each payload field is tri-state:
// omit to leave the stored slot, send `null` to clear it, send a value to
// set/replace it. The inactive slot survives a switch, so toggling back never
// requires re-uploading.
export const TemplateGalleryPageMediaInput = builder.inputType(
  'TemplateGalleryPageMediaInput',
  {
    description:
      'Input for attaching media to a TemplateGalleryPage. `type` (`link`/`mux`/`none`) selects what renders; both payload slots may stay populated at once. For `url` and `muxVideoId`: omit to leave the stored value, pass `null` to clear that slot, or pass a value to set/replace it.',
    fields: (t) => ({
      type: t.field({
        type: TemplateGalleryPageMediaType,
        required: true,
        description:
          'Active selector: which payload renders (`link`/`mux`/`none`). Required.'
      }),
      url: t.string({
        required: false,
        description:
          'The embed URL slot. Omit to leave unchanged, `null` to clear, or a value to set/replace (server-validated and normalized per provider). Provider verification varies: Canva and YouTube are confirmed via oEmbed, but Google Slides is shape-validated only (a published-shaped URL that is actually private or non-existent passes validation), so a stored Google Slides embed is not guaranteed to render.'
      }),
      muxVideoId: t.id({
        required: false,
        description:
          'The Mux upload slot. Omit to leave unchanged, `null` to clear, or a value to set/replace (validated against the media DB).'
      })
    })
  }
)
