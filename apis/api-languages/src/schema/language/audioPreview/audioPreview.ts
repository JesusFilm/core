import { prisma } from '@core/prisma-languages/client'

import { builder } from '../../builder'

const AudioPreview = builder.prismaObject('AudioPreview', {
  fields: (t) => ({
    languageId: t.exposeID('languageId', { nullable: false }),
    language: t.relation('language', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
    duration: t.exposeInt('duration', { nullable: false }),
    size: t.exposeInt('size', { nullable: false }),
    bitrate: t.exposeInt('bitrate', { nullable: false }),
    codec: t.exposeString('codec', { nullable: false })
  })
})

builder.asEntity(AudioPreview, {
  key: builder.selection<{ languageId: string }>('languageId'),
  resolveReference: async ({ languageId }) =>
    await prisma.audioPreview.findUnique({ where: { languageId } })
})

builder.mutationFields((t) => ({
  audioPreviewCreate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'AudioPreview',
    nullable: false,
    input: {
      languageId: t.input.id({ required: true }),
      value: t.input.string({ required: true }),
      duration: t.input.int({ required: true }),
      size: t.input.int({ required: true }),
      bitrate: t.input.int({ required: true }),
      codec: t.input.string({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { input: { languageId, value, duration, size, bitrate, codec } }
    ) => {
      const now = new Date()
      return await prisma.audioPreview.create({
        ...query,
        data: {
          languageId,
          value,
          duration,
          size,
          bitrate,
          codec,
          updatedAt: now
        }
      })
    }
  }),
  audioPreviewUpdate: t.withAuth({ isPublisher: true }).prismaFieldWithInput({
    type: 'AudioPreview',
    nullable: false,
    input: {
      languageId: t.input.id({ required: true }),
      value: t.input.string({ required: false }),
      duration: t.input.int({ required: false }),
      size: t.input.int({ required: false }),
      bitrate: t.input.int({ required: false }),
      codec: t.input.string({ required: false })
    },
    resolve: async (
      query,
      _parent,
      { input: { languageId, value, duration, size, bitrate, codec } }
    ) => {
      const data: Record<string, unknown> = {}
      if (value !== undefined) data.value = value
      if (duration !== undefined) data.duration = duration
      if (size !== undefined) data.size = size
      if (bitrate !== undefined) data.bitrate = bitrate
      if (codec !== undefined) data.codec = codec

      if (Object.keys(data).length === 0) {
        throw new Error('No fields provided to update')
      }

      data.updatedAt = new Date()

      return await prisma.audioPreview.update({
        ...query,
        where: { languageId },
        data
      })
    }
  }),
  audioPreviewDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'AudioPreview',
    nullable: false,
    args: {
      languageId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { languageId }) => {
      return await prisma.audioPreview.delete({
        ...query,
        where: { languageId }
      })
    }
  })
}))
