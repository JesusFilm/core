import { builder } from '../../../builder'

export const SignUpSubmissionEventCreateInput = builder.inputType(
    'SignUpSubmissionEventCreateInput',
    {
      fields: (t) => ({
        id: t.string({ required: false }),
        blockId: t.string({ required: true }),
        stepId: t.string({ required: false }),
        name: t.string({ required: true }),
        email: t.string({ required: true })
      })
    }
  )