import { builder } from '../../builder'

export const JourneyAiTranslateInput = builder.inputType(
  'JourneyAiTranslateInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      name: t.string({ required: true }),
      journeyLanguageName: t.string({ required: true }),
      textLanguageId: t.id({ required: true }),
      textLanguageName: t.string({ required: true })
    })
  }
)
