import { builder } from '../../../builder'

export const ImageBlockCreateInput = builder.inputType(
  'ImageBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({
        required: false,
        description:
          'ID should be unique Response UUID (Provided for optimistic mutation result matching)'
      }),
      parentBlockId: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      src: t.string({ required: false }),
      alt: t.string({ required: true }),
      blurhash: t.string({
        required: false,
        description:
          'If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated.'
      }),
      width: t.int({ required: false }),
      height: t.int({ required: false }),
      isCover: t.boolean({
        required: false,
        description:
          "True if the coverBlockId in a parent block should be set to this block's id."
      }),
      scale: t.int({ required: false }),
      focalTop: t.int({ required: false }),
      focalLeft: t.int({ required: false })
    })
  }
)
