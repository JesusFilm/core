import fs from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fetch from 'node-fetch'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

function getR2Client(): S3Client {
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

async function uploadToR2FromUrl(
  url: string,
  fileName: string,
  contentType: string
): Promise<{ publicUrl: string; actualSize: number }> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')
  if (process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN == null)
    throw new Error('Missing CLOUDFLARE_R2_CUSTOM_DOMAIN')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to download file from ${url}: ${response.statusText}`
    )
  }

  const contentLengthHeader = response.headers.get('content-length')
  const downloadedSize =
    contentLengthHeader != null ? Number(contentLengthHeader) : undefined

  if (downloadedSize === 0)
    throw new Error(`Downloaded file is empty: ${fileName}`)

  const client = getR2Client()
  const MULTIPART_THRESHOLD = 100 * 1024 * 1024 // 100MB
  const MULTIPART_PART_SIZE = 10 * 1024 * 1024 // 10MB

  const shouldUseMultipart =
    downloadedSize == null || downloadedSize >= MULTIPART_THRESHOLD

  if (shouldUseMultipart) {
    const upload = new Upload({
      client,
      params: {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileName,
        Body: response.body as any,
        ContentType: contentType
      },
      queueSize: 4,
      partSize: MULTIPART_PART_SIZE
    })
    await upload.done()
  } else {
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: fileName,
        Body: response.body as any,
        ContentType: contentType,
        ContentLength: downloadedSize
      })
    )
  }

  const head = await client.send(
    new HeadObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName
    })
  )
  const r2Size = head.ContentLength ?? 0
  if (r2Size === 0) throw new Error(`R2 stored object has size 0: ${fileName}`)

  const publicUrl = `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/${fileName}`
  return { publicUrl, actualSize: r2Size }
}

async function migrateMastersToR2(): Promise<void> {
  console.info('Starting master migration to R2')

  const BAD_URLS_PATH = path.resolve('.cache/api-media/bad-master-urls.json')
  async function loadBadUrls(): Promise<Set<string>> {
    try {
      const data = await readFile(BAD_URLS_PATH, 'utf-8')
      const arr: unknown = JSON.parse(data)
      if (Array.isArray(arr))
        return new Set(arr.filter((x) => typeof x === 'string'))
      return new Set()
    } catch {
      return new Set()
    }
  }
  async function saveBadUrls(badSet: Set<string>): Promise<void> {
    const dir = path.dirname(BAD_URLS_PATH)
    if (!fs.existsSync(dir)) await mkdir(dir, { recursive: true })
    const arr = Array.from(badSet)
    arr.sort()
    await writeFile(BAD_URLS_PATH, JSON.stringify(arr, null, 2), 'utf-8')
  }

  const badUrls = await loadBadUrls()

  const where = {
    assetId: null,
    masterUrl: { not: null },
    AND: [
      { masterUrl: { notIn: Array.from(badUrls) } },
      { masterUrl: { not: '' } }
    ]
  }

  let variant = await prisma.videoVariant.findFirst({
    where
  })

  while (variant != null) {
    console.info(`Processing variant: ${variant.id}`)

    try {
      const masterUrl = variant.masterUrl as string
      const urlPath = new URL(masterUrl).pathname
      const extension = path.extname(urlPath) || '.mp4'
      const contentType =
        extension === '.mp4' ? 'video/mp4' : 'application/octet-stream'

      const videoId = variant.videoId
      const languageId = variant.languageId
      const variantId = variant.id

      const fileName = `${videoId}/variants/${languageId}/${variantId}_master${extension}`

      const asset = await prisma.cloudflareR2.create({
        data: {
          fileName,
          userId: 'system',
          contentType,
          contentLength: BigInt(0),
          videoId
        }
      })

      const { publicUrl, actualSize } = await uploadToR2FromUrl(
        masterUrl,
        fileName,
        contentType
      )

      await prisma.cloudflareR2.update({
        where: { id: asset.id },
        data: {
          publicUrl,
          contentLength: BigInt(actualSize)
        }
      })

      await prisma.videoVariant.update({
        where: { id: variantId },
        data: {
          assetId: asset.id,
          masterUrl: publicUrl
        }
      })

      console.info('Successfully processed master for variant')
    } catch (error) {
      console.error(
        { error, variantId: variant.id },
        `Error processing master: ${variant.id}`
      )
      if (variant.masterUrl != null && variant.masterUrl !== '') {
        badUrls.add(variant.masterUrl)
        await saveBadUrls(badUrls)
      }
    }

    variant = await prisma.videoVariant.findFirst({
      where
    })
  }

  console.info('Completed master migration to R2')
}

async function main(): Promise<void> {
  try {
    console.info('Starting master-migrate-r2 script')
    await migrateMastersToR2()
    console.info('Master-migrate-r2 script completed successfully')
  } catch (error) {
    console.error({ error }, 'Master-migrate-r2 script failed')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}

export { main, migrateMastersToR2 }
