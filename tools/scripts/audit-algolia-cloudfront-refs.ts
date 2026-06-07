import { mkdir, readFile, writeFile } from 'fs/promises'
import * as path from 'path'

import { algoliasearch } from 'algoliasearch'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

interface Options {
  envFiles: string[]
  outputDir: string
  indexes: string[]
  limit?: number
  sampleLimit: number
  searchFallback: boolean
}

interface RefSample {
  objectID: string | null
  path: string
  value: string
  host: string
}

interface IndexResult {
  indexName: string
  mode: 'browse' | 'search-fallback'
  warning?: string
  recordsScanned: number
  recordsWithRefs: number
  refsFound: number
  refsByHost: Record<string, number>
  samples: RefSample[]
}

const DEFAULT_OUTPUT_DIR = '.cache/algolia-cloudfront-audit'
const CLOUDFRONT_REGEX =
  /(?:https?:\/\/)?([a-z0-9-]+(?:\.[a-z0-9-]+)*\.cloudfront\.net)(?:\/[^\s"'<>)]*)?/gi
const KNOWN_CLOUDFRONT_HOSTS = [
  'd1wl257kev7hsz.cloudfront.net',
  'd3s4plubcuq0w9.cloudfront.net',
  'd2y2gzgc06w0mw.cloudfront.net',
  'd3lq9cruzluhxq.cloudfront.net',
  'd28w4xgnvon0kf.cloudfront.net',
  'd2b2n918ty14xg.cloudfront.net',
  'dtnrmpankb15.cloudfront.net',
  'd389zwyrhi20m0.cloudfront.net',
  'd1p5hso8kw5pmj.cloudfront.net'
]

const INDEX_ENV_KEYS = [
  'ALGOLIA_INDEX',
  'ALGOLIA_INDEX_VIDEOS',
  'ALGOLIA_INDEX_VIDEO_VARIANTS',
  'ALGOLIA_INDEX_LANGUAGES',
  'ALGOLIA_INDEX_COUNTRIES',
  'NEXT_PUBLIC_ALGOLIA_INDEX',
  'NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS',
  'NEXT_PUBLIC_ALGOLIA_INDEX_LANGUAGES',
  'NEXT_PUBLIC_ALGOLIA_INDEX_COUNTRIES'
]

function parseArgs(): Options {
  const options: Options = {
    envFiles: [],
    outputDir: DEFAULT_OUTPUT_DIR,
    indexes: [],
    sampleLimit: 20,
    searchFallback: true
  }

  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i]
    const next = process.argv[i + 1]

    if (arg === '--env-file' && next != null) {
      options.envFiles.push(next)
      i += 1
    } else if (arg === '--output-dir' && next != null) {
      options.outputDir = next
      i += 1
    } else if (arg === '--index' && next != null) {
      options.indexes.push(next)
      i += 1
    } else if (arg === '--limit' && next != null) {
      options.limit = Number(next)
      i += 1
    } else if (arg === '--sample-limit' && next != null) {
      options.sampleLimit = Number(next)
      i += 1
    } else if (arg === '--no-search-fallback') {
      options.searchFallback = false
    }
  }

  return options
}

async function loadEnvFile(filePath: string): Promise<void> {
  const contents = await readFile(filePath, 'utf8')

  for (const line of contents.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue

    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex)
    const value = line.slice(equalsIndex + 1)
    process.env[key] = value
  }
}

function firstEnv(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]
    if (value != null && value !== '') return value
  }

  return null
}

function requireFirstEnv(...names: string[]): string {
  const value = firstEnv(...names)
  if (value == null) throw new Error(`Missing one of: ${names.join(', ')}`)
  return value
}

function configuredIndexes(explicitIndexes: string[]): string[] {
  const indexes = [
    ...explicitIndexes,
    ...INDEX_ENV_KEYS.flatMap((key) => {
      const value = process.env[key]
      return value == null || value === '' ? [] : [value]
    })
  ]

  return Array.from(new Set(indexes)).sort()
}

function truncate(value: string): string {
  return value.length > 500 ? `${value.slice(0, 497)}...` : value
}

function objectIdFor(record: Record<string, unknown>): string | null {
  const objectID = record.objectID
  if (typeof objectID === 'string') return objectID
  if (typeof objectID === 'number') return String(objectID)
  return null
}

function findRefs(
  value: unknown,
  currentPath = '$'
): Array<{ path: string; value: string; host: string }> {
  if (typeof value === 'string') {
    const matches = Array.from(value.matchAll(CLOUDFRONT_REGEX))
    return matches.map((match) => ({
      path: currentPath,
      value: truncate(match[0]),
      host: match[1].toLowerCase()
    }))
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findRefs(item, `${currentPath}[${index}]`)
    )
  }

  if (value != null && typeof value === 'object') {
    return Object.entries(value as Record<string, JsonValue>).flatMap(
      ([key, child]) => findRefs(child, `${currentPath}.${key}`)
    )
  }

  return []
}

function emptyIndexResult(
  indexName: string,
  mode: IndexResult['mode']
): IndexResult {
  return {
    indexName,
    mode,
    recordsScanned: 0,
    recordsWithRefs: 0,
    refsFound: 0,
    refsByHost: {},
    samples: []
  }
}

function addHit(
  result: IndexResult,
  hit: Record<string, unknown>,
  options: Options
): void {
  result.recordsScanned += 1
  const refs = findRefs(hit)
  if (refs.length === 0) return

  result.recordsWithRefs += 1
  result.refsFound += refs.length

  for (const ref of refs) {
    result.refsByHost[ref.host] = (result.refsByHost[ref.host] ?? 0) + 1
    if (result.samples.length < options.sampleLimit) {
      result.samples.push({ objectID: objectIdFor(hit), ...ref })
    }
  }
}

async function browseIndex(
  client: ReturnType<typeof algoliasearch>,
  indexName: string,
  options: Options
): Promise<IndexResult> {
  const result = emptyIndexResult(indexName, 'browse')
  let cursor: string | undefined
  let page = 0
  const seenCursors = new Set<string>()

  do {
    const browseParams: { hitsPerPage: number; cursor?: string } = {
      hitsPerPage: 1000
    }
    if (cursor != null) browseParams.cursor = cursor

    if (cursor != null) {
      if (seenCursors.has(cursor)) {
        throw new Error(`Algolia browse cursor repeated for ${indexName}`)
      }
      seenCursors.add(cursor)
    }

    const response = await client.browse<Record<string, unknown>>({
      indexName,
      browseParams
    })

    page += 1
    if (page % 10 === 0) {
      console.info(
        `${indexName}: browsed ${page} pages / ${result.recordsScanned} records`
      )
    }

    for (const hit of response.hits ?? []) {
      if (options.limit != null && result.recordsScanned >= options.limit) {
        return result
      }

      addHit(result, hit, options)
    }

    cursor = response.cursor
  } while (cursor != null && cursor !== '')

  return result
}

async function searchFallbackIndex(
  client: ReturnType<typeof algoliasearch>,
  indexName: string,
  options: Options,
  warning: string
): Promise<IndexResult> {
  const result = emptyIndexResult(indexName, 'search-fallback')
  result.warning = warning

  const seenObjectIds = new Set<string>()
  const queries = ['cloudfront.net', ...KNOWN_CLOUDFRONT_HOSTS]

  for (const query of queries) {
    const response = await client.searchSingleIndex<Record<string, unknown>>({
      indexName,
      searchParams: {
        query,
        hitsPerPage: options.limit ?? 1000,
        attributesToRetrieve: ['*']
      }
    })

    for (const hit of response.hits ?? []) {
      if (options.limit != null && result.recordsScanned >= options.limit) {
        return result
      }

      const objectID = objectIdFor(hit) ?? JSON.stringify(hit).slice(0, 100)
      if (seenObjectIds.has(objectID)) continue

      seenObjectIds.add(objectID)
      addHit(result, hit, options)
    }
  }

  return result
}

async function auditIndex(
  client: ReturnType<typeof algoliasearch>,
  indexName: string,
  options: Options
): Promise<IndexResult> {
  try {
    return await browseIndex(client, indexName, options)
  } catch (error) {
    if (!options.searchFallback) throw error

    const message = error instanceof Error ? error.message : String(error)
    return await searchFallbackIndex(
      client,
      indexName,
      options,
      `Browse failed; used search fallback instead. ${message}`
    )
  }
}

async function main(): Promise<void> {
  const options = parseArgs()
  for (const envFile of options.envFiles) await loadEnvFile(envFile)

  const appId = requireFirstEnv(
    'ALGOLIA_APPLICATION_ID',
    'NEXT_PUBLIC_ALGOLIA_APP_ID'
  )
  const apiKey = requireFirstEnv(
    'ADMIN_ALGOLIA_KEY',
    'ALGOLIA_API_KEY',
    'ALGOLIA_API_KEY_LANGUAGES',
    'ALGOLIA_SERVER_API_KEY',
    'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY',
    'NEXT_PUBLIC_ALGOLIA_API_KEY'
  )
  const indexes = configuredIndexes(options.indexes)
  if (indexes.length === 0) throw new Error('No Algolia indexes configured')

  const client = algoliasearch(appId, apiKey)
  const generatedAt = new Date().toISOString()
  const results = []

  console.info('=== ALGOLIA CLOUDFRONT AUDIT ===')
  console.info(`indexes: ${indexes.join(', ')}`)
  console.info(`limit: ${options.limit ?? 'none'}`)

  for (const indexName of indexes) {
    console.info(`Auditing ${indexName}`)
    const result = await auditIndex(client, indexName, options)
    results.push(result)
    console.info(
      `${indexName}: mode=${result.mode} scanned=${result.recordsScanned} recordsWithRefs=${result.recordsWithRefs} refs=${result.refsFound}`
    )
  }

  const summary = {
    generatedAt,
    indexesAudited: results.length,
    recordsScanned: results.reduce(
      (total, result) => total + result.recordsScanned,
      0
    ),
    recordsWithRefs: results.reduce(
      (total, result) => total + result.recordsWithRefs,
      0
    ),
    refsFound: results.reduce((total, result) => total + result.refsFound, 0),
    results
  }

  await mkdir(options.outputDir, { recursive: true })
  const outputPath = path.join(
    options.outputDir,
    `audit-results-${generatedAt.replace(/[:.]/g, '-')}.json`
  )
  await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`)

  console.info('')
  console.info('=== SUMMARY ===')
  console.info(`records scanned: ${summary.recordsScanned}`)
  console.info(`records with refs: ${summary.recordsWithRefs}`)
  console.info(`refs found: ${summary.refsFound}`)
  console.info(`JSON artifact: ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
