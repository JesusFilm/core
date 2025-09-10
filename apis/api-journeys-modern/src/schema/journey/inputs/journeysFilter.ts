import { builder } from '../../builder'

export const JourneysFilter = builder.inputType('JourneysFilter', {
  fields: (t) => ({
    featured: t.boolean({ required: false }),
    template: t.boolean({ required: false }),
    ids: t.idList({ required: false }),
    tagIds: t.idList({ required: false }),
    languageIds: t.idList({ required: false }),
    limit: t.int({ required: false }),
    orderByRecent: t.boolean({ required: false }),
    fromTemplateId: t.id({ required: false })
  })
})
