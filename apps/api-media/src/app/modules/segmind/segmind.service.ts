import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import fetch from 'node-fetch'

import { CloudflareImage } from '.prisma/api-media-client'

import { SegmindModel } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { ImageService } from '../cloudflare/image/image.service'

@Injectable()
export class SegmindService {
  constructor(
    private readonly imageService: ImageService,
    private readonly prismaService: PrismaService
  ) {}

  async createImageFromPrompt(
    prompt: string,
    model: SegmindModel,
    userId: string
  ): Promise<CloudflareImage | undefined> {
    const body = new FormData()
    let path: string
    switch (model) {
      case SegmindModel.kandinsky2__2_txt2img:
        path = 'kandinsky2.2-txt2img'
        break
      case SegmindModel.sd1__5_paragon:
        path = 'sd1.5-paragon'
        break
      case SegmindModel.sdxl1__0_txt2img:
        path = 'sdxl1.0-txt2img'
        body.append('num_inference_steps', 20)
        body.append('samples', 1)
        body.append('scheduler', 'UniPC')
        break
      case SegmindModel.tinysd1__5_txt2img:
        path = 'tinysd1.5-txt2img'
        break
    }
    body.append('prompt', prompt)
    const res0 = await fetch(`https://api.segmind.com/v1/${path}`, {
      method: 'POST',
      headers: {
        'x-api-key': 'SG_af1efec064571acf'
      },
      body
    })

    if (res0.status === 200) {
      const res1 = await this.imageService.uploadImageToCloudflare(res0.body)

      if (!res1.success) {
        throw new Error(res1.errors[0])
      }
      return await this.prismaService.cloudflareImage.create({
        data: {
          id: res1.result.id,
          userId,
          uploaded: true
        }
      })
    }
  }
}
