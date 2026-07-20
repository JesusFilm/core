import { builder } from '../../builder'

export const QrCodeUpdateInput = builder.inputType('QrCodeUpdateInput', {
  fields: (t) => ({
    to: t.string({
      required: false,
      description:
        'journey url where the QR code redirects to, will be parsed and stored as ids'
    }),
    color: t.string({ required: false }),
    backgroundColor: t.string({ required: false })
  })
})
