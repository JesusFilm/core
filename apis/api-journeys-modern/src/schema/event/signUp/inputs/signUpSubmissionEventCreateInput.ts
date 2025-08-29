import { builder } from '../../../builder'

export const SignUpSubmissionEventCreateInput = builder.inputType(
  'SignUpSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      name: t.string({ required: true }),
      email: t.string({ required: true })
    })
  }
)
