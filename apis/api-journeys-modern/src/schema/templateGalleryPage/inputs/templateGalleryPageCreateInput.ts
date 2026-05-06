import { builder } from '../../builder'

export const TemplateGalleryPageCreateInput = builder.inputType(
  'TemplateGalleryPageCreateInput',
  {
    fields: (t) => ({
      teamId: t.id({ required: true }),
      title: t.string({ required: true }),
      description: t.string({ required: false }),
      creatorName: t.string({ required: true }),
      creatorImageBlockId: t.id({ required: false }),
      mediaUrl: t.string({ required: false }),
      journeyIds: t.idList({ required: false })
    })
  }
)
