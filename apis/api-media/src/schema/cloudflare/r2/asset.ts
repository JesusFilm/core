import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'

import {
  CloudflareR2CompleteMultipartInput,
  CloudflareR2CreateInput,
  CloudflareR2MultipartPrepareInput
} from './inputs'

const MIN_MULTIPART_PART_SIZE = 5 * 1024 * 1024 // 5 MiB
const DEFAULT_MULTIPART_PART_SIZE = 64 * 1024 * 1024 // 64 MiB
const MAX_MULTIPART_PARTS = 10000
const MULTIPART_PRESIGN_EXPIRES_IN_SECONDS = 4 * 60 * 60 // 4 hours

function pickPartSize(
  contentLength: number,
  preferred?: number | null
): number {
  const safePreferred =
    preferred != null && preferred >= MIN_MULTIPART_PART_SIZE
      ? preferred
      : undefined

  const basePartSize = safePreferred ?? DEFAULT_MULTIPART_PART_SIZE
  const partsWithBase = Math.ceil(contentLength / basePartSize)

  if (partsWithBase <= MAX_MULTIPART_PARTS) return basePartSize

  return Math.max(
    MIN_MULTIPART_PART_SIZE,
    Math.ceil(contentLength / MAX_MULTIPART_PARTS)
  )
}

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

export async function createMultipartUpload(
  fileName: string,
  contentType: string
): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  const response = await getClient().send(
    new CreateMultipartUploadCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      ContentType: contentType
    })
  )

  if (response.UploadId == null)
    throw new Error('Failed to create multipart upload')

  return response.UploadId
}

export async function getMultipartPartUrl(
  fileName: string,
  uploadId: string,
  partNumber: number
): Promise<string> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  return await getSignedUrl(
    getClient(),
    new UploadPartCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName,
      UploadId: uploadId,
      PartNumber: partNumber
    }),
    { expiresIn: MULTIPART_PRESIGN_EXPIRES_IN_SECONDS }
  )
}

interface MultipartPart {
  partNumber: number
  eTag: string
}

export async function completeMultipartUpload(
  fileName: string,
  uploadId: string,
  parts: MultipartPart[]
): Promise<void> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  if (parts.length === 0) throw new Error('No uploaded parts provided')

  const client = getClient()

  try {
    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            ETag: part.eTag,
            PartNumber: part.partNumber
          }))
        }
      })
    )
  } catch (error) {
    await client.send(
      new AbortMultipartUploadCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileName,
        UploadId: uploadId
      })
    )
    throw error
  }
}

export async function deleteR2File(fileName: string): Promise<void> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  const client = getClient()
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName
    })
  )
}

builder.prismaObject('CloudflareR2', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    contentLength: t.field({
      type: 'BigInt',
      nullable: false,
      resolve: (parent) => BigInt(parent.contentLength)
    }),
    contentType: t.exposeString('contentType', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    originalFilename: t.exposeString('originalFilename'),
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

const CloudflareR2MultipartPreparedPart = builder
  .objectRef<{
    uploadUrl: string
    partNumber: number
  }>('CloudflareR2MultipartPreparedPart')
  .implement({
    description: 'Presigned upload URL for a multipart part',
    fields: (t) => ({
      uploadUrl: t.string({
        description: 'Presigned URL for the part',
        resolve: (parent) => parent.uploadUrl
      }),
      partNumber: t.int({
        description: '1-indexed part number',
        resolve: (parent) => parent.partNumber
      })
    })
  })

const CloudflareR2MultipartPrepared = builder
  .objectRef<{
    id: string
    uploadId: string
    fileName: string
    publicUrl: string | null
    partSize: number
    parts: Array<{ uploadUrl: string; partNumber: number }>
  }>('CloudflareR2MultipartPrepared')
  .implement({
    description:
      'Metadata returned when preparing a multipart upload for Cloudflare R2',
    fields: (t) => ({
      id: t.string({
        description: 'CloudflareR2 record id',
        resolve: (parent) => parent.id
      }),
      uploadId: t.string({
        description: 'Upload ID for the multipart upload',
        resolve: (parent) => parent.uploadId
      }),
      fileName: t.string({
        description: 'Object key for the multipart upload',
        resolve: (parent) => parent.fileName
      }),
      publicUrl: t.string({
        description: 'Public URL for the completed asset',
        nullable: true,
        resolve: (parent) => parent.publicUrl
      }),
      partSize: t.int({
        description: 'Part size in bytes',
        resolve: (parent) => parent.partSize
      }),
      parts: t.field({
        type: [CloudflareR2MultipartPreparedPart],
        description: 'Presigned URLs for each multipart part',
        resolve: (parent) => parent.parts
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

      if (input.contentLength < 0) {
        throw new Error('Content length must be non-negative')
      }

      const uploadUrl = await getPresignedUrl(input.fileName, input.contentType)
      return await prisma.cloudflareR2.create({
        ...query,
        data: {
          id: input.id ?? undefined,
          videoId: input.videoId,
          userId: user.id,
          fileName: input.fileName,
          originalFilename: input.originalFilename,
          uploadUrl,
          publicUrl: `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${input.fileName}`,
          contentType: input.contentType,
          contentLength: input.contentLength
        }
      })
    }
  }),
  cloudflareR2MultipartPrepare: t.withAuth({ isPublisher: true }).field({
    type: CloudflareR2MultipartPrepared,
    description:
      'Prepare a multipart upload for Cloudflare R2 and return presigned part URLs',
    nullable: false,
    args: {
      input: t.arg({ type: CloudflareR2MultipartPrepareInput, required: true })
    },
    resolve: async (_parent, { input }, { user }) => {
      if (user == null) throw new Error('User not found')
      if (input.contentLength < 0)
        throw new Error('Content length must be non-negative')

      const contentLengthNumber = Number(input.contentLength)
      const partSize = pickPartSize(
        contentLengthNumber,
        input.preferredPartSize
      )
      const totalParts = Math.ceil(contentLengthNumber / partSize)

      const uploadId = await createMultipartUpload(
        input.fileName,
        input.contentType
      )

      const parts: Array<{ partNumber: number; uploadUrl: string }> = []
      for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
        const uploadUrl = await getMultipartPartUrl(
          input.fileName,
          uploadId,
          partNumber
        )
        parts.push({ partNumber, uploadUrl })
      }

      const asset = await prisma.cloudflareR2.create({
        data: {
          id: input.id ?? undefined,
          videoId: input.videoId,
          userId: user.id,
          fileName: input.fileName,
          originalFilename: input.originalFilename,
          uploadUrl: null,
          publicUrl: `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${input.fileName}`,
          contentType: input.contentType,
          contentLength: input.contentLength
        }
      })

      return {
        id: asset.id,
        uploadId,
        fileName: asset.fileName,
        publicUrl: asset.publicUrl,
        partSize,
        parts
      }
    }
  }),

  cloudflareR2CompleteMultipart: t.withAuth({ isPublisher: true }).prismaField({
    type: 'CloudflareR2',
    description: 'Complete a multipart upload and persist the asset record',
    nullable: false,
    args: {
      input: t.arg({
        type: CloudflareR2CompleteMultipartInput,
        required: true
      })
    },
    resolve: async (query, _parent, { input }) => {
      if (input.parts.length === 0)
        throw new Error('At least one part is required to complete upload')

      await completeMultipartUpload(input.fileName, input.uploadId, [
        ...input.parts
      ])

      if (input.id == null) {
        throw new Error('Multipart upload record id is required to complete')
      }

      return await prisma.cloudflareR2.update({
        ...query,
        where: { id: input.id },
        data: {}
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
