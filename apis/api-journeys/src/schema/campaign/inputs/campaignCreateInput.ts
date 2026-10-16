import { builder } from '../../builder'

export const CampaignCreateInput = builder.inputType('CampaignCreateInput', {
  description:
    'Input for creating a Campaign. Nothing else is taken: the slug, language row, theme, pages, chrome, strings and starter sections are all seeded (the Campaign Seed).',
  fields: (t) => ({
    teamId: t.id({
      required: true,
      description: 'Owning team. Caller must be a member or manager.'
    }),
    title: t.string({
      required: true,
      description:
        'Default-language title, required, at most 100 characters. Drives slug generation.'
    }),
    defaultLanguageId: t.id({
      required: true,
      description:
        'api-languages Language id; must exist. Becomes the single Page Language and the default of every Translated Field.'
    })
  })
})
