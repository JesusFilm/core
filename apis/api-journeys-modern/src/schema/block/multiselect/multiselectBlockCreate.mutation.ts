import { builder } from '../../builder'

import { MultiselectBlockCreateInput } from './inputs/multiselectBlockCreateInput'

builder.mutationField('createMultiselectBlock', {
  args: {
    input: MultiselectBlockCreateInput
  },
  resolve: async (_, { input }) => {
    return await prisma.block.create({ data: input })
  }
})
