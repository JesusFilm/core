import { Logger } from 'pino'
import { z } from 'zod'

import { Service as PrismaService } from '.prisma/api-media-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

// Get the hostname based on the environment
function getHostname(): string {
  const env = process.env.DOPPLER_ENVIRONMENT || 'dev'

  switch (env) {
    case 'prd':
      return 'arc.gt'
    case 'stg':
      return 'stg.arc.gt'
    case 'dev':
    default:
      return 'localhost.arc.gt'
  }
}

// Global variable to store the domain ID for caching
let cachedDomainId: string | null = null

// Function to get or create the domain and return its ID
async function getOrCreateDomain(): Promise<string> {
  if (cachedDomainId) return cachedDomainId

  const hostname = getHostname()
  const apexName = 'arc.gt'

  const domain = await prisma.shortLinkDomain.upsert({
    where: { hostname },
    update: {},
    create: {
      hostname,
      apexName,
      services: [PrismaService.apiMedia]
    }
  })

  if (process.env.NODE_ENV !== 'test') cachedDomainId = domain.id
  return domain.id
}

// Function to get the shortLink schema with the domain ID
async function getShortLinkSchema() {
  // Get the domain ID
  const domainId = await getOrCreateDomain()

  return z
    .object({
      keyword: z.string(),
      url: z.string().url(),
      title: z.string(),
      timestamp: z.object({ value: z.string().datetime() }),
      ip: z.string(),
      clicks: z.number()
    })
    .transform((data) => ({
      pathname: data.keyword,
      to: data.url,
      domainId,
      service: PrismaService.apiMedia
    }))
}

export async function importShortLinks(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_shorturls_prod.yourls_url',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const schema = await getShortLinkSchema()
  const shortLinkData = parse(schema, row, 'keyword')

  await prisma.shortLink.upsert({
    where: {
      pathname_domainId: {
        pathname: shortLinkData.pathname,
        domainId: shortLinkData.domainId
      }
    },
    update: {
      pathname: shortLinkData.pathname,
      to: shortLinkData.to,
      service: shortLinkData.service
    },
    create: shortLinkData
  })
}

export async function importMany(
  rows: unknown[],
  logger?: Logger
): Promise<void> {
  const schema = await getShortLinkSchema()
  const { data: shortLinks, inValidRowIds } = parseMany(schema, rows, 'keyword')

  if (inValidRowIds.length > 0) {
    logger?.warn(`${inValidRowIds.length} invalid rows will be skipped`)
  }

  if (shortLinks.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  const result = await prisma.shortLink.createMany({
    data: shortLinks,
    skipDuplicates: true
  })

  logger?.info(
    `Inserted ${result.count} new shortlinks, skipped ${shortLinks.length - result.count} duplicates`
  )
}
