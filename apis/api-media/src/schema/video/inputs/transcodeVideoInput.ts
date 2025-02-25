import { builder } from '../../builder'

export const TranscodeVideoInput = builder.inputType('TranscodeVideoInput', {
  fields: (t) => ({
    r2AssetId: t.string({ required: true }),
    outputUrl: t.string({ required: true }),
    resolution: t.string({ required: true }),
    bitrate: t.int({ required: false })
  })
})
