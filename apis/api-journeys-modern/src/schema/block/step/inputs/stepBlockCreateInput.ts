import { builder } from '../../../builder'

export const StepBlockCreateInput = builder.inputType('StepBlockCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    journeyId: t.id({ required: true }),
    nextBlockId: t.id({ required: false }),
    locked: t.boolean({ required: false }),
    x: t.int({
      required: false,
      description:
        'x is used to position the block horizontally in the journey flow diagram on the editor.'
    }),
    y: t.int({
      required: false,
      description:
        'y is used to position the block vertically in the journey flow diagram on the editor.'
    })
  })
})
