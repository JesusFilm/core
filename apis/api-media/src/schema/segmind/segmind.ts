import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { createImageFromText } from '../cloudflare/image/service'

import { SegmindModel } from './enums/segmindModel'

builder.mutationFields((t) => ({
  createImageBySegmindPrompt: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      deprecationReason: 'use createCloudflareImageFromPrompt',
      type: 'CloudflareImage',
      nullable: false,
      args: {
        prompt: t.arg.string({ required: true }),
        model: t.arg({ type: SegmindModel, required: true })
      },
      async resolve(query, _root, { prompt }, { user }) {
        // The Journey editor still calls this mutation for Workers AI images.
        const image = await createImageFromText(prompt)

        return await prisma.cloudflareImage.create({
          ...query,
          data: {
            id: image.id,
            uploaded: true,
            userId: user.id,
            isAi: true
          }
        })
      }
    })
}))
