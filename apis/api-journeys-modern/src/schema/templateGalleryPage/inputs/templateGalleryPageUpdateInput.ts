import { builder } from '../../builder'

// Deliberately omits status, publishedAt, id, teamId, createdAt, updatedAt — those are
// either immutable or transitioned via dedicated mutations (templateGalleryPagePublish).
export const TemplateGalleryPageUpdateInput = builder.inputType(
  'TemplateGalleryPageUpdateInput',
  {
    fields: (t) => ({
      title: t.string({ required: false }),
      description: t.string({ required: false }),
      slug: t.string({ required: false }),
      creatorName: t.string({ required: false }),
      creatorImageBlockId: t.id({ required: false }),
      mediaUrl: t.string({ required: false }),
      journeyIds: t.idList({ required: false })
    })
  }
)
