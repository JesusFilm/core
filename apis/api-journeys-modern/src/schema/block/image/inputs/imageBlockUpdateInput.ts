import { builder } from '../../../builder'

export const ImageBlockUpdateInput = builder.inputType(
  'ImageBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      src: t.string({ required: false }),
      alt: t.string({ required: false }),
      blurhash: t.string({
        required: false,
        description:
          'If blurhash, width, & height are provided, the image will skip blurhash processing. Otherwise these values will be calculated.'
      }),
      width: t.int({ required: false }),
      height: t.int({ required: false }),
      isCover: t.boolean({ required: false }),
      scale: t.int({ required: false }),
      focalTop: t.int({ required: false }),
      focalLeft: t.int({ required: false })
    })
  }
)
