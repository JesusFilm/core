import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import {
  createImageFromResponse,
  createImageFromText
} from '../cloudflare/image/service'

import { SegmindModel } from './enums/segmindModel'

builder.mutationFields((t) => ({
  createImageBySegmindPrompt: t.prismaField({
    deprecationReason: 'use createCloudflareImageFromPrompt',
    type: 'CloudflareImage',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      prompt: t.arg.string({ required: true }),
      model: t.arg({ type: SegmindModel, required: true })
    },
    async resolve(query, _root, { prompt }, { userId }) {
      // We retired the segmind service in favor of Cloudflare Workers AI.
      // At the time of this migration, Cloudflare Workers AI is free for
      // image generation. This resolver remains intact for historical
      // reasons and should be removed in the future.

      if (userId == null) throw new Error('User not found')

      const image = await createImageFromResponse(
        await createImageFromText(prompt)
      )

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id: image.id,
          uploaded: true,
          userId
        }
      })
    }
  })
}))
