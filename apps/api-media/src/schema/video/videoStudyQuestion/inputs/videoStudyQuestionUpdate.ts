import { builder } from '../../../builder'

export const VideoStudyQuestionUpdateInput = builder.inputType(
  'VideoStudyQuestionUpdateInput',
  {
    fields: (t) => ({
      id: t.id({ required: true }),
      value: t.string({ required: false }),
      primary: t.boolean({ required: false }),
      languageId: t.string({ required: false }),
      crowdInId: t.string({ required: false }),
      order: t.int({ required: false })
    })
  }
)
