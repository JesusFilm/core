import { z } from 'zod'

export const LanguageSchema = z.object({
  id: z.string(),
  bcp47: z.string(),
  iso3: z.string(),
  name: z.array(
    z.object({
      value: z.string(),
      primary: z.boolean(),
      __typename: z.literal('LanguageName')
    })
  ),
  __typename: z.literal('Language')
})
