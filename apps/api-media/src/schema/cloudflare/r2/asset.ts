import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import { CloudflareR2CreateInput } from './inputs/cloudflareR2Create'
import { CloudflareR2UpdateInput } from './inputs/cloudflareR2Update'

export function getClient(): S3Client {
  if (process.env.CLOUDFLARE_R2_ENDPOINT == null)
    throw new Error('Missing CLOUDFLARE_R2_ENDPOINT')
  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID == null)
    throw new Error('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')
  if (process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY == null)
    throw new Error('Missing CLOUDFLARE_R2_SECRET_ACCESS_KEY')

  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    }
  })
}

export async function getPresignedUrl(fileName: string): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  return await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName
    })
  )
}

builder.prismaObject('CloudflareR2', {
  fields: (t) => ({
    id: t.exposeID('id'),
    fileName: t.exposeString('fileName'),
    uploadUrl: t
      .withAuth({ isPublisher: true })
      .exposeString('uploadUrl', { nullable: true }),
    userId: t.withAuth({ isPublisher: true }).exposeID('userId'),
    publicUrl: t.exposeString('publicUrl', { nullable: true }),
    createdAt: t.expose('createdAt', {
      type: 'Date'
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'Date'
    })
  })
})

builder.queryFields((t) => ({
  videoCloudflareAssets: t.prismaField({
    type: ['CloudflareR2'],
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { videoId }) => {
      return await prisma.cloudflareR2.findMany({
        ...query,
        where: { videoId }
      })
    }
  })
}))

builder.mutationFields((t) => ({
  cloudflareR2Create: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    args: {
      input: t.arg({ type: CloudflareR2CreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      const uploadUrl = await getPresignedUrl(input.fileName)

      return await prisma.cloudflareR2.create({
        ...query,
        data: {
          ...input,
          id: input.id ?? undefined,
          userId: user.id,
          fileName: input.fileName,
          uploadUrl,
          publicUrl: `process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN/${input.fileName}`
        }
      })
    }
  }),
  r2AssetUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    args: {
      input: t.arg({ type: CloudflareR2UpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user }) => {
      const uploadUrl = await getPresignedUrl(input.fileName)
      return await prisma.cloudflareR2.update({
        ...query,
        where: { id: input.id },
        data: {
          fileName: input.fileName ?? undefined,
          uploadUrl,
          publicUrl: `process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN/${input.fileName}`,
          userId: user.id
        }
      })
    }
  }),
  r2AssetDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      return await prisma.cloudflareR2.delete({
        ...query,
        where: { id }
      })
    }
  })
}))
