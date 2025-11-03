import { builder } from '../../../builder'

export const GenerateSubtitlesInput = builder.inputType(
  'GenerateSubtitlesInput',
  {
    fields: (t) => ({
      languageCode: t.string({ required: true })
    })
  }
)
