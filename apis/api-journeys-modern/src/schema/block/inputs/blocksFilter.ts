import { builder } from '../../builder'

export const BlocksFilter = builder.inputType('BlocksFilter', {
  fields: (t) => ({
    journeyIds: t.idList({ required: false }),
    typenames: t.stringList({ required: false })
  })
})
