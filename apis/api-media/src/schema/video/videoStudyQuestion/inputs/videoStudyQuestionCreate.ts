import { builder } from '../../../builder'

export const VideoStudyQuestionCreateInput = builder.inputType(
  'VideoStudyQuestionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      videoId: t.string({ required: true }),
      value: t.string({ required: true }),
      primary: t.boolean({ required: true }),
      languageId: t.string({ required: true }),
      crowdInId: t.string({ required: false }),
      order: t.int({ required: true, description: 'index from 1' })
    })
  }
)
