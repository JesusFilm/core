import { z } from 'zod'

// Shape validation for TemplateGalleryPageMediaInput. The model retains both
// payload slots at once and uses `type` as the active selector, so there is NO
// mutual-exclusion invariant — the only hard requirement is a valid `type`.
//
// Per-slot tri-state (preserved from the GraphQL input, not collapsed here):
//   url / muxVideoId omitted  → leave that slot as-is
//   url / muxVideoId === null → clear that slot
//   url / muxVideoId === value → set/replace that slot (validated downstream)
//
// `.min(1)` rejects an empty-string payload while `.nullish()` still allows the
// explicit-null clear and the omitted-leave cases.
export const mediaInputSchema = z.object({
  type: z.enum(['link', 'mux', 'none']),
  url: z.string().min(1).nullish(),
  muxVideoId: z.string().min(1).nullish()
})

export type MediaInput = z.infer<typeof mediaInputSchema>
