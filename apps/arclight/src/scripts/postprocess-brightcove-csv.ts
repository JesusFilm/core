import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline'

const DEFAULT_INPUT_PATH = 'apps/arclight/src/scripts/brightcove-content.csv'
const DEFAULT_OUTPUT_PATH =
  'apps/arclight/src/scripts/brightcove-content-enriched.csv'

const DEFAULT_SOURCE_ID_MAP: Record<string, string> = {
  TEMP: '0',
  WESS: '1',
  SAVVY: '10',
  BP: '11',
  SECONDLEVEL: '12',
  RENEW: '13',
  REVELATION: '14',
  CREATE: '15',
  GSFN: '2',
  MENTORLINK: '3',
  AIA: '4',
  VOKE: '5',
  LUMO: '6',
  NUA: '7',
  NS: '8',
  IMB: '9'
}

interface InferenceResult {
  sourceCode: string
  sourceId: string
  languageId: string
  mediaComponentId: string
  inferenceMethod: string
}

function parseSourceIdMap(value: string | undefined): Record<string, string> {
  if (!value?.trim()) return DEFAULT_SOURCE_ID_MAP

  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null)
      return DEFAULT_SOURCE_ID_MAP

    const entries = Object.entries(parsed).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === 'string' && typeof entry[1] === 'string'
    )

    if (entries.length === 0) return DEFAULT_SOURCE_ID_MAP

    return Object.fromEntries(
      entries.map(([sourceCode, sourceId]) => [
        sourceCode.trim().toUpperCase(),
        sourceId.trim()
      ])
    )
  } catch {
    return DEFAULT_SOURCE_ID_MAP
  }
}

function parseCsvLine(line: string): string[] {
  const columns: string[] = []
  let current = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        index++
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === ',' && !insideQuotes) {
      columns.push(current)
      current = ''
      continue
    }

    current += char
  }

  columns.push(current)
  return columns
}

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""')
  if (/[",\n\r]/.test(escaped)) return `"${escaped}"`
  return escaped
}

function getValueByHeader(
  headers: string[],
  row: string[],
  headerName: string
): string {
  const index = headers.indexOf(headerName)
  if (index < 0) return ''
  return row[index] ?? ''
}

function normalizeComponentSlug(componentSlug: string): string {
  const segments = componentSlug
    .split('-')
    .map((segment) => segment.trim())
    .filter(Boolean)
  if (segments.length === 0) return ''

  const hasLeadingNumericSegment = /^\d+$/.test(segments[0])
  const shouldDropLeadingNumericSegment =
    hasLeadingNumericSegment && segments[0] !== '0' && segments.length > 1
  const slugSegments = shouldDropLeadingNumericSegment
    ? segments.slice(1)
    : segments
  if (slugSegments.length === 0) return ''

  const edition = slugSegments[0].toLowerCase()
  if (edition === 'ot' || edition.startsWith('ot')) {
    slugSegments[0] = `jf${slugSegments[0].slice(2)}`
  } else if (edition === 'jl' || edition.startsWith('jl')) {
    slugSegments[0] = `jf${slugSegments[0].slice(2)}`
  } else if (edition === 'ec' || edition.startsWith('ec')) {
    slugSegments[0] = `cl${slugSegments[0].slice(2)}`
  } else if (edition === 'ac' || edition.startsWith('ac')) {
    slugSegments[0] = `cl${slugSegments[0].slice(2)}`
  } else if (edition.startsWith('fj_')) {
    slugSegments[0] = slugSegments[0].replace(/^fj_0+(\d+)$/i, 'fj_$1')
  }

  if (/^wl\d*_rpc$/i.test(slugSegments[0])) {
    slugSegments[0] = slugSegments[0].replace(/_rpc$/i, '')
  }

  const hasWlWithInjectedIds =
    /^wl\d*$/i.test(slugSegments[0]) &&
    slugSegments.length >= 3 &&
    /^\d+$/.test(slugSegments[1]) &&
    /^\d+$/.test(slugSegments[2])
  if (hasWlWithInjectedIds) {
    slugSegments[1] = '0'
    slugSegments[2] = '0'
  }

  return slugSegments.join('-')
}

function parseReference(referenceId: string): {
  sourceCode: string
  languageId: string
  componentSlug: string
} | null {
  const match = referenceId.match(/^([A-Za-z0-9]+)_([0-9]+)-(.+?)_[0-9]+$/)
  if (!match) return null

  const [, sourceCode, languageId, componentSlug] = match
  const normalizedComponentSlug = normalizeComponentSlug(componentSlug)
  return {
    sourceCode: sourceCode.toUpperCase(),
    languageId,
    componentSlug: normalizedComponentSlug || componentSlug
  }
}

function parseCustomFields(rawCustomFields: string): Record<string, string> {
  if (!rawCustomFields.trim()) return {}

  try {
    const parsed: unknown = JSON.parse(rawCustomFields)
    if (typeof parsed !== 'object' || parsed === null) return {}

    const output: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        output[key.toLowerCase()] = value
      }
    }

    return output
  } catch {
    return {}
  }
}

function inferRow(params: {
  referenceId: string
  customFieldsRaw: string
  sourceIdMap: Record<string, string>
}): InferenceResult {
  const { referenceId, customFieldsRaw, sourceIdMap } = params
  const customFields = parseCustomFields(customFieldsRaw)
  const parsedReference = parseReference(referenceId)
  const parsedFromMasterAsset = parseReference(
    customFields.masterasseturl
      ?.split('/')
      .pop()
      ?.replace(/\.mp4$/i, '') ?? ''
  )

  const sourceCodeFromCustom = customFields.sourcename?.toUpperCase() ?? ''
  const sourceCode =
    sourceCodeFromCustom ||
    parsedReference?.sourceCode ||
    parsedFromMasterAsset?.sourceCode ||
    ''

  const sourceId = sourceCode ? (sourceIdMap[sourceCode] ?? '') : ''

  const languageId =
    customFields.languageid ||
    parsedReference?.languageId ||
    parsedFromMasterAsset?.languageId ||
    ''

  const customMediaComponentId = customFields.mediacomponentid ?? ''
  let mediaComponentId = customMediaComponentId

  if (!mediaComponentId && parsedReference?.componentSlug && sourceId) {
    mediaComponentId = `${sourceId}_${parsedReference.componentSlug}`
  }

  if (!mediaComponentId && parsedFromMasterAsset?.componentSlug && sourceId) {
    mediaComponentId = `${sourceId}_${parsedFromMasterAsset.componentSlug}`
  }

  const inferenceMethod = customMediaComponentId
    ? 'customFields'
    : parsedReference
      ? 'referenceId'
      : parsedFromMasterAsset
        ? 'masterasseturl'
        : 'unknown'

  return {
    sourceCode,
    sourceId,
    languageId,
    mediaComponentId,
    inferenceMethod
  }
}

async function writeLine(
  writer: ReturnType<typeof createWriteStream>,
  line: string
): Promise<void> {
  if (writer.write(`${line}\n`)) return

  await new Promise<void>((resolvePromise, rejectPromise) => {
    writer.once('drain', resolvePromise)
    writer.once('error', rejectPromise)
  })
}

async function main(): Promise<void> {
  const inputPath = process.env.BC_POSTPROCESS_INPUT_PATH || DEFAULT_INPUT_PATH
  const outputPath =
    process.env.BC_POSTPROCESS_OUTPUT_PATH || DEFAULT_OUTPUT_PATH
  const sourceIdMap = parseSourceIdMap(process.env.BC_SOURCE_ID_MAP)

  await mkdir(dirname(resolve(outputPath)), { recursive: true })

  const inputStream = createReadStream(resolve(inputPath), { encoding: 'utf8' })
  const reader = createInterface({
    input: inputStream,
    crlfDelay: Infinity
  })
  const writer = createWriteStream(resolve(outputPath), { encoding: 'utf8' })

  let headers: string[] | null = null
  let rowCount = 0
  let inferredFromCustomFields = 0
  let inferredFromReferenceId = 0
  let inferredFromMasterAsset = 0
  let unknownInferences = 0
  const unmappedSourceCodeCounts = new Map<string, number>()

  for await (const rawLine of reader) {
    const line = rowCount === 0 ? rawLine.replace(/^\uFEFF/, '') : rawLine
    if (line.trim().length === 0) continue

    const values = parseCsvLine(line)
    if (!headers) {
      headers = values
      const outputHeaders = [
        'referenceId',
        'name',
        'updated_at',
        'inferedFromStuff',
        'videoId',
        'languageId',
        'inferenceMethod'
      ]
      await writeLine(writer, outputHeaders.map(csvEscape).join(','))
      continue
    }

    const referenceId = getValueByHeader(headers, values, 'referenceId')
    const customFieldsRaw = getValueByHeader(headers, values, 'customFields')
    const inferred = inferRow({
      referenceId,
      customFieldsRaw,
      sourceIdMap
    })

    if (inferred.inferenceMethod === 'customFields') inferredFromCustomFields++
    else if (inferred.inferenceMethod === 'referenceId')
      inferredFromReferenceId++
    else if (inferred.inferenceMethod === 'masterasseturl') {
      inferredFromMasterAsset++
    } else unknownInferences++

    if (inferred.sourceCode && !inferred.sourceId) {
      const currentCount =
        unmappedSourceCodeCounts.get(inferred.sourceCode) ?? 0
      unmappedSourceCodeCounts.set(inferred.sourceCode, currentCount + 1)
    }

    const name = getValueByHeader(headers, values, 'name')
    const updatedAt = getValueByHeader(headers, values, 'updatedAt')
    const videoId = getValueByHeader(headers, values, 'id')

    const outputRow = [
      referenceId,
      name,
      updatedAt,
      inferred.mediaComponentId,
      videoId,
      inferred.languageId,
      inferred.inferenceMethod
    ]

    await writeLine(writer, outputRow.map(csvEscape).join(','))
    rowCount++

    if (rowCount % 25000 === 0) {
      console.log(`Processed ${rowCount} rows`)
    }
  }

  await new Promise<void>((resolvePromise, rejectPromise) => {
    writer.end(() => resolvePromise())
    writer.once('error', rejectPromise)
  })

  console.log('=== Postprocess complete ===')
  console.log(`Input: ${inputPath}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Rows processed: ${rowCount}`)
  console.log(`Inference from customFields: ${inferredFromCustomFields}`)
  console.log(`Inference from referenceId: ${inferredFromReferenceId}`)
  console.log(`Inference from masterasseturl: ${inferredFromMasterAsset}`)
  console.log(`Unknown inference: ${unknownInferences}`)
  if (unmappedSourceCodeCounts.size === 0) {
    console.log('Unmapped source codes: none')
    return
  }

  console.log('Unmapped source codes:')
  const sortedUnmappedSourceCodes = Array.from(
    unmappedSourceCodeCounts.entries()
  )
    .sort((a, b) => b[1] - a[1])
    .map(([sourceCode, count]) => `${sourceCode}: ${count}`)
  for (const item of sortedUnmappedSourceCodes) {
    console.log(`- ${item}`)
  }
}

if (require.main === module) {
  void main().catch((error) => {
    console.error('Postprocess failed:', error)
    process.exitCode = 1
  })
}
