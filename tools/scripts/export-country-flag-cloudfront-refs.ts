import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../libs/prisma/languages/src/__generated__/client/client'

interface Options {
  envFile?: string
  label: string
  outputDir: string
}

interface CountryFlagRow {
  id: string
  flagPngSrc: string | null
  flagWebpSrc: string | null
}

const HOSTS = [
  {
    key: 'image-prod',
    bucket: 'arclight-image-prod',
    hostname: 'd1wl257kev7hsz.cloudfront.net'
  },
  {
    key: 'image-stage',
    bucket: 'arclight-image-stage',
    hostname: 'd3s4plubcuq0w9.cloudfront.net'
  }
]

function parseArgs(): Options {
  const options: Options = {
    label: 'api-languages/current',
    outputDir: '.cache/country-flag-cloudfront-refs'
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

function getHost(value: string | null): string | null {
  return value?.match(/https?:\/\/([^/]+)/i)?.[1] ?? null
}

function summarizeRows(rows: CountryFlagRow[], hostname: string) {
  return {
    rows: rows.length,
    both: rows.filter(
      ({ flagPngSrc, flagWebpSrc }) =>
        flagPngSrc?.includes(hostname) === true &&
        flagWebpSrc?.includes(hostname) === true
    ).length,
    pngOnly: rows.filter(
      ({ flagPngSrc, flagWebpSrc }) =>
        flagPngSrc?.includes(hostname) === true &&
        flagWebpSrc?.includes(hostname) !== true
    ).length,
    webpOnly: rows.filter(
      ({ flagPngSrc, flagWebpSrc }) =>
        flagPngSrc?.includes(hostname) !== true &&
        flagWebpSrc?.includes(hostname) === true
    ).length
  }
}

async function main(): Promise<void> {
  const options = parseArgs()
  if (options.envFile != null) {
    await loadEnvFile(options.envFile)
  }

  const connectionString = process.env.PG_DATABASE_URL_LANGUAGES
  if (connectionString == null || connectionString === '') {
    throw new Error('PG_DATABASE_URL_LANGUAGES is required')
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

    console.log(`Country flag CloudFront refs for ${options.label}`)

    for (const host of HOSTS) {
      const rows = await prisma.$queryRawUnsafe<CountryFlagRow[]>(
        `
          select id, "flagPngSrc", "flagWebpSrc"
          from public."Country"
          where coalesce("flagPngSrc", '') like $1
             or coalesce("flagWebpSrc", '') like $1
          order by id asc
        `,
        `%${host.hostname}%`
      )
      const summary = summarizeRows(rows, host.hostname)
      const samples = rows.slice(0, 12).map((row) => ({
        id: row.id,
        pngHost: getHost(row.flagPngSrc),
        webpHost: getHost(row.flagWebpSrc),
        flagPngSrc: row.flagPngSrc,
        flagWebpSrc: row.flagWebpSrc
      }))

      ;(output.hosts as unknown[]).push({
        ...host,
        ...summary,
        samples,
        rows
      })

      console.log(
        `${host.key}: rows=${summary.rows}, both=${summary.both}, pngOnly=${summary.pngOnly}, webpOnly=${summary.webpOnly}`
      )
      for (const sample of samples) {
        console.log(
          `  ${sample.id}: png=${sample.pngHost ?? 'null'} webp=${sample.webpHost ?? 'null'}`
        )
      }
    }

    const outputPath = path.join(runDir, 'country-flags.json')
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
