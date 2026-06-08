import { z } from 'zod'

// Discriminated-union validation for TemplateGalleryPageMediaInput. No Pothos
// @oneOf plugin is loaded in this subgraph, so the one-of invariant is enforced
// in zod (matching the blockUpdateAction zod precedent).
//
// This schema is the single source of truth for the SHAPE invariant only. The
// per-type helper dispatch (linkValidate / muxValidate) and the row composition
// live in resolveMediaInput, which both the Create and Update mutations call
// BEFORE opening their prisma.$transaction — it performs external IO (provider
// oEmbed fetches, the cross-DB Mux read) that must not run inside a tx.
//
//   type=link → `url` required, `muxVideoId` must be absent/null
//   type=mux  → `muxVideoId` required, `url` must be absent/null
export const mediaInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('link'),
    url: z.string().min(1),
    muxVideoId: z.null().optional()
  }),
  z.object({
    type: z.literal('mux'),
    muxVideoId: z.string().min(1),
    url: z.null().optional()
  })
])

export type MediaInput = z.infer<typeof mediaInputSchema>
