import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

interface Options {
  envFile?: string
  label: string
  outputDir: string
}

interface AssetRow {
  source: string
  id: string
  url: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

const HOSTS = [
  {
    key: 'image-prod',
    hostname: 'd1wl257kev7hsz.cloudfront.net'
  },
  {
    key: 'image-stage',
    hostname: 'd3s4plubcuq0w9.cloudfront.net'
  }
]

function parseArgs(): Options {
  const options: Options = {
    label: 'api-media/current',
    outputDir: '.cache/media-flag-assets'
  }

  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i]
    const next = process.argv[i + 1]

    if (arg === '--env-file' && next != null) {
      options.envFile = next
      i += 1
    } else if (arg === '--label' && next != null) {
      options.label = next
      i += 1
    } else if (arg === '--output-dir' && next != null) {
      options.outputDir = next
      i += 1
    }
  }

  return options
}

async function loadEnvFile(envFile: string): Promise<void> {
  const { readFile } = await import('fs/promises')
  const contents = await readFile(envFile, 'utf8')

  for (const line of contents.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue

    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex)
    const value = line.slice(equalsIndex + 1)
    process.env[key] = value
  }
}

function getPath(value: string | null): string | null {
  if (value == null) return null

  try {
    return new URL(value).pathname
  } catch {
    return null
  }
}

async function main(): Promise<void> {
  const options = parseArgs()
  if (options.envFile != null) {
    await loadEnvFile(options.envFile)
  }

  const connectionString = process.env.PG_DATABASE_URL_MEDIA
  if (connectionString == null || connectionString === '') {
    throw new Error('PG_DATABASE_URL_MEDIA is required')
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000
    })
  })

  const generatedAt = new Date().toISOString()
  const runDir = path.join(
    options.outputDir,
    generatedAt.replace(/[:.]/g, '-')
  )
  await mkdir(runDir, { recursive: true })

  try {
    const output: Record<string, unknown> = {
      generatedAt,
      label: options.label,
      hosts: []
    }

    console.log(`Media flag assets for ${options.label}`)

    for (const host of HOSTS) {
      const rows = await prisma.$queryRawUnsafe<AssetRow[]>(
        `
          select 'CloudflareImage.uploadUrl' as source,
                 id,
                 "uploadUrl" as url,
                 "createdAt",
                 "updatedAt"
          from public."CloudflareImage"
          where coalesce("uploadUrl", '') like $1
            and coalesce("uploadUrl", '') like '%/flags/%'
          union all
          select 'CloudflareR2.publicUrl' as source,
                 id,
                 "publicUrl" as url,
                 "createdAt",
                 "updatedAt"
          from public."CloudflareR2"
          where coalesce("publicUrl", '') like $1
            and coalesce("publicUrl", '') like '%/flags/%'
          union all
          select 'CloudflareR2.uploadUrl' as source,
                 id,
                 "uploadUrl" as url,
                 "createdAt",
                 "updatedAt"
          from public."CloudflareR2"
          where coalesce("uploadUrl", '') like $1
            and coalesce("uploadUrl", '') like '%/flags/%'
          order by source asc, url asc
        `,
        `%${host.hostname}%`
      )
      const bySource = rows.reduce<Record<string, number>>((memo, row) => {
        memo[row.source] = (memo[row.source] ?? 0) + 1
        return memo
      }, {})
      const samples = rows.slice(0, 12).map((row) => ({
        source: row.source,
        id: row.id,
        path: getPath(row.url),
        url: row.url
      }))

      ;(output.hosts as unknown[]).push({
        ...host,
        rowCount: rows.length,
        bySource,
        samples,
        rows
      })

      console.log(`${host.key}: rows=${rows.length}`)
      for (const [source, count] of Object.entries(bySource)) {
        console.log(`  ${source}: ${count}`)
      }
      for (const sample of samples) {
        console.log(`  ${sample.source}: ${sample.path ?? sample.url}`)
      }
    }

    const outputPath = path.join(runDir, 'media-flag-assets.json')
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`)
    console.log(`JSON artifact: ${outputPath}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
