import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { uploadImageToCloudflare } from '../cloudflare/image/service'

import { SegmindModel } from './enums/segmindModel'

builder.mutationFields((t) => ({
  createImageBySegmindPrompt: t.prismaField({
    type: 'CloudflareImage',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      prompt: t.arg.string({ required: true }),
      model: t.arg({ type: SegmindModel, required: true })
    },
    async resolve(query, _root, { prompt, model }, { userId }) {
      if (userId == null) throw new Error('User not found')

      const body = new FormData()
      let path = 'sdxl1.0-txt2img' // defaulted to avoid error
      switch (model) {
        case 'sdxl1__0_txt2img':
          path = 'sdxl1.0-txt2img'
          body.append('num_inference_steps', '20')
          body.append('samples', '1')
          body.append('scheduler', 'UniPC')
          body.append('img_height', '1024')
          body.append('img_width', '1024')
          break
      }
      body.append('prompt', prompt)
      const res0 = await fetch(`https://api.segmind.com/v1/${path}`, {
        method: 'POST',
        headers: { 'x-api-key': process.env.SEGMIND_API_KEY ?? '' },
        body
      })

      if (res0.status !== 200) throw new Error(res0.statusText)

      const res1 = await uploadImageToCloudflare(res0.body)

      if (!res1.success) throw new Error(res1.errors[0])

      return await prisma.cloudflareImage.create({
        ...query,
        data: {
          id: res1.result.id,
          uploaded: true,
          userId
        }
      })
    }
  })
}))
