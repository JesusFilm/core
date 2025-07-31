import { builder } from '../../../builder'

export const TextResponseSubmissionEventCreateInput = builder.inputType(
    'TextResponseSubmissionEventCreateInput',
    {
      fields: (t) => ({
        id: t.string({ required: false }),
        blockId: t.string({ required: true }),
        stepId: t.string({ required: false }),
        label: t.string({ required: false }),
        value: t.string({ required: true })
      })
    }
  )