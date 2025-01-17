import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

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
      const block = await prisma.block.findFirst({
        where: { videoId: id, typename: 'VideoBlock', source: 'cloudflare' }
      })
      if (block == null) return false

      const update = await prisma.block.update({
        where: { id: block.id },
        data: { source: 'mux' }
      })
      return update != null
    }
  })
}))
