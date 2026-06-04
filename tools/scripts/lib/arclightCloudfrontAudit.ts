import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export interface Distribution {
  key: string
  bucket: string
  hostname: string
  expected: boolean
  keep: boolean
}

type EnvironmentName = 'prod' | 'stage' | 'current'

type PrismaLike = {
  $queryRawUnsafe: <T>(query: string, ...values: unknown[]) => Promise<T>
  $disconnect: () => Promise<void>
} & Record<string, any>

export interface FlaggedColumn {
  table: string
  column: string
  note?: string
}

export interface ServiceConfig {
  name: string
  databaseUrlEnv: string
  outputDir: string
  flaggedColumns: FlaggedColumn[]
  createPrismaClient: (connectionString: string) => PrismaLike
  typedCount?: (
    prisma: PrismaLike,
    table: string,
    column: string,
    hostname: string
  ) => Promise<number | undefined>
}

interface ColumnRef {
  table: string
  column: string
  exists: boolean
  source: 'flagged' | 'sweep'
  counts: Record<string, number>
  samples: Record<string, string[]>
  note?: string
}

interface ServiceEnvironmentResult {
  databaseUrlSource: string
  flaggedColumns: ColumnRef[]
  sweepColumns: ColumnRef[]
  unexpectedColumns: ColumnRef[]
  missingFlaggedColumns: string[]
}

interface ServiceResult {
  service: string
  environments: Partial<Record<EnvironmentName, ServiceEnvironmentResult>>
}

interface Verdict {
  bucket: string
  hostname: string
  verdict: 'KEEP' | 'SAFE TO DELETE' | 'BLOCKED'
  prodRefs: number
  stageRefs: number
  currentRefs: number
  details: string[]
}

interface AuditResult {
  generatedAt: string
  services: ServiceResult[]
  distributions: Distribution[]
  verdicts: Verdict[]
}

interface TextColumn {
  table_name: string
  column_name: string
}

const SAMPLE_LIMIT = 5
const OTHER_CLOUDFRONT_KEY = 'OTHER cloudfront'

export const DISTRIBUTIONS: Distribution[] = [
  {
    key: 'image-prod',
    bucket: 'arclight-image-prod',
    hostname: 'd1wl257kev7hsz.cloudfront.net',
    expected: true,
    keep: true
  },
  {
    key: 'image-stage',
    bucket: 'arclight-image-stage',
    hostname: 'd3s4plubcuq0w9.cloudfront.net',
    expected: true,
    keep: true
  },
  {
    key: 'audio-prod',
    bucket: 'arclight-audio-prod',
    hostname: 'd2y2gzgc06w0mw.cloudfront.net',
    expected: false,
    keep: false
  },
  {
    key: 'audio-stage',
    bucket: 'arclight-audio-stage',
    hostname: 'd3lq9cruzluhxq.cloudfront.net',
    expected: false,
    keep: false
  },
  {
    key: 'media-qa',
    bucket: 'arclight-media-qa',
    hostname: 'd28w4xgnvon0kf.cloudfront.net',
    expected: false,
    keep: false
  },
  {
    key: 'media-prod',
    bucket: 'arclight-media-prod',
    hostname: 'd2b2n918ty14xg.cloudfront.net',
    expected: false,
    keep: false
  },
  {
    key: 'subtitles-qa',
    bucket: 'arclight-subtitles-qa',
    hostname: 'dtnrmpankb15.cloudfront.net',
    expected: false,
    keep: false
  },
  {
    key: 'subtitles-prod',
    bucket: 'arclight-subtitles-prod',
    hostname: 'd389zwyrhi20m0.cloudfront.net',
    expected: false,
    keep: false
  },
  {
    key: '3gp',
    bucket: 'arclight-3gp',
    hostname: 'd1p5hso8kw5pmj.cloudfront.net',
    expected: false,
    keep: false
  }
]

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

function tableColumnKey(table: string, column: string): string {
  return `${table}.${column}`
}

function cloudfrontRegex(): string {
  return '([a-z0-9-]+\\.)?cloudfront\\.net'
}

function knownHostRegex(): string {
  return DISTRIBUTIONS.map(({ hostname }) => escapeRegex(hostname)).join('|')
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function countRows(rows: Array<{ count: string | bigint | number }>): number {
  const rawCount = rows[0]?.count ?? 0
  return Number(rawCount)
}

async function columnExists(
  prisma: PrismaLike,
  table: string,
  column: string
): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `
      select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = $1
          and column_name = $2
      ) as exists
    `,
    table,
    column
  )

  return rows[0]?.exists === true
}

async function rawCount(
  prisma: PrismaLike,
  table: string,
  column: string,
  regex: string,
  excludeKnownHosts = false
): Promise<number> {
  const knownHostExclusions = excludeKnownHosts
    ? `and not ((${quoteIdent(column)})::text ~* $2)`
    : ''
  const values = excludeKnownHosts ? [regex, knownHostRegex()] : [regex]
  const rows = await prisma.$queryRawUnsafe<Array<{ count: string }>>(
    `
      select count(*)::text as count
      from public.${quoteIdent(table)}
      where (${quoteIdent(column)})::text ~* $1
      ${knownHostExclusions}
    `,
    ...values
  )

  return countRows(rows)
}

async function rawSamples(
  prisma: PrismaLike,
  table: string,
  column: string,
  regex: string,
  excludeKnownHosts = false
): Promise<string[]> {
  const knownHostExclusions = excludeKnownHosts
    ? `and not ((${quoteIdent(column)})::text ~* $2)`
    : ''
  const values = excludeKnownHosts ? [regex, knownHostRegex()] : [regex]
  const rows = await prisma.$queryRawUnsafe<Array<{ value: string }>>(
    `
      select left((${quoteIdent(column)})::text, 500) as value
      from public.${quoteIdent(table)}
      where (${quoteIdent(column)})::text ~* $1
      ${knownHostExclusions}
      limit ${SAMPLE_LIMIT}
    `,
    ...values
  )

  return rows.map(({ value }) => value)
}

async function auditColumn(
  prisma: PrismaLike,
  service: ServiceConfig,
  flaggedColumn: FlaggedColumn,
  source: ColumnRef['source']
): Promise<ColumnRef> {
  const { table, column, note } = flaggedColumn
  const exists = await columnExists(prisma, table, column)
  const counts: Record<string, number> = {}
  const samples: Record<string, string[]> = {}

  if (!exists) {
    return { table, column, exists, source, counts, samples, note }
  }

  for (const distribution of DISTRIBUTIONS) {
    const typedCount = await service.typedCount?.(
      prisma,
      table,
      column,
      distribution.hostname
    )
    const count =
      typedCount ??
      (await rawCount(
        prisma,
        table,
        column,
        escapeRegex(distribution.hostname)
      ))

    counts[distribution.key] = count
    samples[distribution.key] =
      count > 0
        ? await rawSamples(
            prisma,
            table,
            column,
            escapeRegex(distribution.hostname)
          )
        : []
  }

  const otherCount = await rawCount(
    prisma,
    table,
    column,
    cloudfrontRegex(),
    true
  )
  counts[OTHER_CLOUDFRONT_KEY] = otherCount
  samples[OTHER_CLOUDFRONT_KEY] =
    otherCount > 0
      ? await rawSamples(prisma, table, column, cloudfrontRegex(), true)
      : []

  return { table, column, exists, source, counts, samples, note }
}

async function getTextColumns(prisma: PrismaLike): Promise<TextColumn[]> {
  return prisma.$queryRawUnsafe<TextColumn[]>(`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and (
        data_type in ('text', 'character varying', 'character', 'json', 'jsonb')
        or udt_name = 'citext'
      )
    order by table_name, ordinal_position
  `)
}

function isFlaggedColumn(
  flaggedColumns: FlaggedColumn[],
  table: string,
  column: string
): boolean {
  return flaggedColumns.some(
    (candidate) => candidate.table === table && candidate.column === column
  )
}

function hasAnyRefs(column: ColumnRef): boolean {
  return Object.values(column.counts).some((count) => count > 0)
}

function unexpectedColumnsFor(
  columns: ColumnRef[],
  flaggedColumns: ColumnRef[]
): ColumnRef[] {
  const flaggedKeys = new Set(
    flaggedColumns.map(({ table, column }) => tableColumnKey(table, column))
  )

  return columns.filter((column) => {
    if (!hasAnyRefs(column)) return false

    const key = tableColumnKey(column.table, column.column)
    return !flaggedKeys.has(key)
  })
}

function getConfiguredEnvironments(
  databaseUrlEnv: string
): Array<{ name: EnvironmentName; databaseUrl: string; source: string }> {
  const configuredEnvironments: Array<{
    name: EnvironmentName
    databaseUrl?: string
    source: string
  }> = [
    {
      name: 'prod',
      databaseUrl: process.env[`${databaseUrlEnv}_PROD`],
      source: `${databaseUrlEnv}_PROD`
    },
    {
      name: 'stage',
      databaseUrl: process.env[`${databaseUrlEnv}_STAGE`],
      source: `${databaseUrlEnv}_STAGE`
    }
  ]

  const environments = configuredEnvironments.flatMap((environment) =>
    environment.databaseUrl != null && environment.databaseUrl !== ''
      ? [
          {
            name: environment.name,
            databaseUrl: environment.databaseUrl,
            source: environment.source
          }
        ]
      : []
  )

  if (environments.length > 0) return environments

  const currentDatabaseUrl = process.env[databaseUrlEnv]
  if (currentDatabaseUrl != null && currentDatabaseUrl !== '') {
    return [
      {
        name: 'current',
        databaseUrl: currentDatabaseUrl,
        source: databaseUrlEnv
      }
    ]
  }

  return []
}

async function auditEnvironment(
  service: ServiceConfig,
  name: EnvironmentName,
  databaseUrl: string,
  databaseUrlSource: string
): Promise<ServiceEnvironmentResult> {
  console.info(`Auditing ${service.name}/${name} (${databaseUrlSource})`)

  const prisma = service.createPrismaClient(databaseUrl)

  try {
    const flaggedColumns = []
    for (const flaggedColumn of service.flaggedColumns) {
      flaggedColumns.push(
        await auditColumn(prisma, service, flaggedColumn, 'flagged')
      )
    }

    const textColumns = await getTextColumns(prisma)
    const sweepColumns = []

    for (const { table_name: table, column_name: column } of textColumns) {
      if (isFlaggedColumn(service.flaggedColumns, table, column)) continue

      const cloudfrontCount = await rawCount(
        prisma,
        table,
        column,
        cloudfrontRegex()
      )
      if (cloudfrontCount === 0) continue

      sweepColumns.push(
        await auditColumn(prisma, service, { table, column }, 'sweep')
      )
    }

    const missingFlaggedColumns = flaggedColumns
      .filter(({ exists }) => !exists)
      .map(({ table, column }) => tableColumnKey(table, column))

    return {
      databaseUrlSource,
      flaggedColumns,
      sweepColumns,
      unexpectedColumns: unexpectedColumnsFor(sweepColumns, flaggedColumns),
      missingFlaggedColumns
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function auditService(
  service: ServiceConfig
): Promise<ServiceResult | null> {
  const environments = getConfiguredEnvironments(service.databaseUrlEnv)
  if (environments.length === 0) {
    console.warn(
      `Skipping ${service.name}: set ${service.databaseUrlEnv}_PROD and ${service.databaseUrlEnv}_STAGE, or ${service.databaseUrlEnv}.`
    )
    return null
  }

  const result: ServiceResult = { service: service.name, environments: {} }
  for (const environment of environments) {
    result.environments[environment.name] = await auditEnvironment(
      service,
      environment.name,
      environment.databaseUrl,
      environment.source
    )
  }

  return result
}

function countDistributionRefs(
  services: ServiceResult[],
  environmentName: EnvironmentName,
  distributionKey: string
): number {
  return services.reduce((serviceTotal, service) => {
    const environment = service.environments[environmentName]
    if (environment == null) return serviceTotal

    const environmentTotal = [
      ...environment.flaggedColumns,
      ...environment.sweepColumns
    ].reduce(
      (total, column) => total + (column.counts[distributionKey] ?? 0),
      0
    )

    return serviceTotal + environmentTotal
  }, 0)
}

function buildVerdicts(services: ServiceResult[]): Verdict[] {
  return DISTRIBUTIONS.map((distribution) => {
    const prodRefs = countDistributionRefs(services, 'prod', distribution.key)
    const stageRefs = countDistributionRefs(services, 'stage', distribution.key)
    const currentRefs = countDistributionRefs(
      services,
      'current',
      distribution.key
    )

    const details = services.flatMap((service) =>
      Object.entries(service.environments).flatMap(
        ([environmentName, environment]) => {
          if (environment == null) return []

          return [...environment.flaggedColumns, ...environment.sweepColumns]
            .filter((column) => (column.counts[distribution.key] ?? 0) > 0)
            .map(
              (column) =>
                `${service.service}/${environmentName}: ${tableColumnKey(
                  column.table,
                  column.column
                )}=${formatNumber(column.counts[distribution.key] ?? 0)}`
            )
        }
      )
    )

    if (distribution.keep) {
      return {
        bucket: distribution.bucket,
        hostname: distribution.hostname,
        verdict: 'KEEP',
        prodRefs,
        stageRefs,
        currentRefs,
        details
      }
    }

    const totalRefs = prodRefs + stageRefs + currentRefs
    return {
      bucket: distribution.bucket,
      hostname: distribution.hostname,
      verdict: totalRefs === 0 ? 'SAFE TO DELETE' : 'BLOCKED',
      prodRefs,
      stageRefs,
      currentRefs,
      details
    }
  })
}

function printColumn(column: ColumnRef): void {
  if (!column.exists) {
    console.info(`${tableColumnKey(column.table, column.column)}: MISSING`)
    return
  }

  console.info(`${tableColumnKey(column.table, column.column)}:`)
  for (const distribution of DISTRIBUTIONS) {
    console.info(
      `  ${distribution.key.padEnd(15)} (${distribution.hostname.replace(
        '.cloudfront.net',
        ''
      )}): ${formatNumber(column.counts[distribution.key] ?? 0)}`
    )
  }
  console.info(
    `  ${OTHER_CLOUDFRONT_KEY.padEnd(15)}: ${formatNumber(
      column.counts[OTHER_CLOUDFRONT_KEY] ?? 0
    )}`
  )
}

function printSummary(result: AuditResult, outputPath: string): void {
  for (const service of result.services) {
    for (const environmentName of ['prod', 'stage', 'current'] as const) {
      const environment = service.environments[environmentName]
      if (environment == null) continue

      console.info('')
      console.info(`=== ${service.service}/${environmentName} ===`)
      for (const column of environment.flaggedColumns) {
        printColumn(column)
      }

      console.info('information_schema sweep (other cloudfront refs):')
      if (environment.sweepColumns.length === 0) {
        console.info('  none')
      } else {
        for (const column of environment.sweepColumns) {
          for (const distribution of DISTRIBUTIONS) {
            const count = column.counts[distribution.key] ?? 0
            if (count === 0) continue
            const marker = distribution.expected ? 'EXPECTED' : 'UNEXPECTED'
            console.info(
              `  ${tableColumnKey(column.table, column.column)}: ${formatNumber(
                count
              )} rows match ${distribution.hostname.replace(
                '.cloudfront.net',
                ''
              )} (${distribution.key}) [${marker}]`
            )
          }

          const otherCount = column.counts[OTHER_CLOUDFRONT_KEY] ?? 0
          if (otherCount > 0) {
            console.info(
              `  ${tableColumnKey(column.table, column.column)}: ${formatNumber(
                otherCount
              )} rows match other cloudfront host [UNEXPECTED]`
            )
          }
        }
      }

      if (environment.missingFlaggedColumns.length > 0) {
        console.info('missing flagged columns:')
        for (const column of environment.missingFlaggedColumns) {
          console.info(`  ${column}`)
        }
      }
    }
  }

  console.info('')
  console.info('=== VERDICT ===')
  for (const verdict of result.verdicts) {
    const suffix =
      verdict.details.length > 0
        ? ` (${verdict.details.join('; ')})`
        : ' (0 refs in audited envs)'
    console.info(`${verdict.bucket.padEnd(24)} -> ${verdict.verdict}${suffix}`)
  }

  console.info('')
  console.info(`JSON artifact: ${outputPath}`)
}

export async function runCloudfrontAudit(
  services: ServiceConfig[],
  outputDir = path.resolve('.cache/arclight-cloudfront-audit')
): Promise<string> {
  const generatedAt = new Date().toISOString()
  const serviceResults = []

  for (const service of services) {
    const result = await auditService(service)
    if (result != null) serviceResults.push(result)
  }

  if (serviceResults.length === 0) {
    throw new Error(
      'No databases configured. Set *_PROD and *_STAGE database URLs, or a single current database URL.'
    )
  }

  const auditResult: AuditResult = {
    generatedAt,
    services: serviceResults,
    distributions: DISTRIBUTIONS,
    verdicts: buildVerdicts(serviceResults)
  }

  await mkdir(outputDir, { recursive: true })
  const outputPath = path.join(
    outputDir,
    `audit-results-${generatedAt.replace(/[:.]/g, '-')}.json`
  )
  await writeFile(outputPath, JSON.stringify(auditResult, null, 2), 'utf-8')

  printSummary(auditResult, outputPath)

  return outputPath
}
