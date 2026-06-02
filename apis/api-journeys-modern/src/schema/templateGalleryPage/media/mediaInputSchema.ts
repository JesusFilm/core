import { z } from 'zod'

// Discriminated-union validation for TemplateGalleryPageMediaInput. No Pothos
// @oneOf plugin is loaded in this subgraph, so the one-of invariant is enforced
// here at the resolver (matching the blockUpdateAction zod precedent).
//
// This is intentionally just the SHAPE schema — the per-type helper dispatch
// (linkValidate / muxValidate) and the row composition stay inlined at each
// call site (Create + Update), so the external IO is visible at the resolver
// rather than hidden behind an orchestrator. The schema is shared only so the
// shape invariant has a single source of truth across both mutations.
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
