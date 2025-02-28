import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import { CloudflareR2CreateInput } from './inputs/cloudflareR2Create'

export function getClient(): S3Client {
  if (process.env.CLOUDFLARE_R2_ENDPOINT == null)
    throw new Error('Missing CLOUDFLARE_R2_ENDPOINT')
  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID == null)
    throw new Error('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')
  if (process.env.CLOUDFLARE_R2_SECRET == null)
    throw new Error('Missing CLOUDFLARE_R2_SECRET')

  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET
    }
  })
}

export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  return await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      ContentType: contentType
    })
  )
}

builder.prismaObject('CloudflareR2', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    contentLength: t.exposeInt('contentLength', { nullable: false }),
    contentType: t.exposeString('contentType', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    uploadUrl: t.withAuth({ isPublisher: true }).exposeString('uploadUrl'),
    userId: t
      .withAuth({ isPublisher: true })
      .exposeID('userId', { nullable: false }),
    publicUrl: t.exposeString('publicUrl'),
    createdAt: t.expose('createdAt', {
      type: 'Date',
      nullable: false
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'Date',
      nullable: false
    })
  })
})

builder.mutationFields((t) => ({
  cloudflareR2Create: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    description: 'The endpoint to upload a file to Cloudflare R2',
    nullable: false,
    args: {
      input: t.arg({ type: CloudflareR2CreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      if (user == null) throw new Error('User not found')
      const uploadUrl = await getPresignedUrl(input.fileName, input.contentType)
      return await prisma.cloudflareR2.create({
        ...query,
        data: {
          id: input.id ?? undefined,
          videoId: input.videoId,
          userId: user.id,
          fileName: input.fileName,
          uploadUrl,
          publicUrl: `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${input.fileName}`
        }
      })
    }
  }),
  cloudflareR2Delete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      return await prisma.cloudflareR2.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
