import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

builder.queryFields((t) => ({
  cloudflareVideoBlockIds: t.withAuth({ isValidInterop: true }).field({
    nullable: false,
    type: ['ID'],
    resolve: async () => {
      const ids = await prisma.block.findMany({
        select: { id: true },
        where: { typename: 'VideoBlock', source: 'cloudflare' }
      })
      return ids.map(({ id }) => id)
    }
  })
}))

builder.mutationFields((t) => ({
  videoBlockCloudflareToMux: t.withAuth({ isValidInterop: true }).boolean({
    nullable: false,
    args: {
      id: t.arg({
        type: 'ID',
        required: true,
        description: 'Cloudflare Video ID'
      })
    },
    resolve: async (_root, { id }) => {
      const blocks = await prisma.block.findMany({
        where: { videoId: id, typename: 'VideoBlock', source: 'cloudflare' }
      })
      if (blocks.length == null) return false

      for (const block of blocks) {
        await prisma.block.update({
          where: { id: block.id },
          data: { source: 'mux' }
        })
      }
      return true
    }
  })
}))
