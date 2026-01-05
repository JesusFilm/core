import { builder } from '../../../builder'

export const StepBlockUpdateInput = builder.inputType('StepBlockUpdateInput', {
  fields: (t) => ({
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
    }),
    slug: t.string({
      required: false,
      description:
        'Slug should be unique amongst all blocks (server will throw BAD_USER_INPUT error if not). If not required will use the current block id. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness'
    })
  })
})
