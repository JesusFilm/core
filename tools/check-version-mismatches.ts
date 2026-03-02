#!/usr/bin/env ts-node

/**
 * Script to check if version numbers in a CSV file match production database
 *
 * This script reads a CSV file with Film Name, Language ID, and Version columns,
 * then queries the production database to verify if those versions actually exist
 * and reports any mismatches or missing versions.
 *
 * Usage:
 *   npx ts-node tools/check-version-mismatches.ts [csv-file-path]
 *
 * If no CSV path is provided, it will look for:
 *   tools/Problem language versions from Post Production - Complete Version List.csv
 */

import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { join } from 'path'
import { writeFileSync, existsSync } from 'fs'
import { prisma as mediaPrisma } from '../libs/prisma/media/src/client'
import { prisma as languagesPrisma } from '../libs/prisma/languages/src/client'

// Load environment variables
require('dotenv').config({ path: 'apis/api-media/.env' })
require('dotenv').config({ path: 'apis/api-languages/.env' })

interface CsvRow {
  filmName: string
  languageId: string
  languageBcp47: string | null
  version: number
  reEncodeStarted: string | null
  totalPresent: number
  totalMissing: number
  missingVideoIds: string
}

interface FilmConfig {
  name: string
  videoIdPattern: string // SQL LIKE pattern
}

interface VersionMismatch {
  filmName: string
  languageId: string
  languageBcp47: string | null
  languageName: string | null
  csvVersions: number[]
  productionVersions: number[]
  missingVersions: number[] // Versions in CSV but not in production
  reEncodeStarted: string | null
}

interface LanguageData {
  bcp47: string | null
  name: string | null
}

// Configuration for different films to check
const FILM_CONFIGS: FilmConfig[] = [
  { name: 'JESUS Film', videoIdPattern: '%jf%' },
  { name: 'Walking with Jesus Africa', videoIdPattern: '%wjv%' },
  { name: 'Story Clubs', videoIdPattern: '%cl13%' },
  { name: 'Story of Jesus for Children', videoIdPattern: '1_cl-0-0' },
  { name: 'Following Jesus India', videoIdPattern: '%fj%' },
  { name: 'My last Day', videoIdPattern: '%mld%' },
  { name: 'Rivka', videoIdPattern: '%riv%' },
  { name: 'Magdalena', videoIdPattern: '%wl%' },
  { name: 'Reflections of Hope', videoIdPattern: '%wl7%' }
]

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current) // Add last value

  return values
}

async function parseCSV(filePath: string): Promise<CsvRow[]> {
  const rows: CsvRow[] = []
  const fileStream = createReadStream(filePath)
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let isFirstLine = true

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false
      continue // Skip header
    }

    if (!line.trim()) continue

    const values = parseCSVLine(line)
    if (values.length < 4) continue

    const version = parseInt(values[3], 10)
    if (isNaN(version)) continue

    rows.push({
      filmName: values[0]?.trim() || '',
      languageId: values[1]?.trim() || '',
      languageBcp47: values[2]?.trim() || null,
      version,
      reEncodeStarted: values[4]?.trim() || null,
      totalPresent: parseInt(values[5] || '0', 10) || 0,
      totalMissing: parseInt(values[6] || '0', 10) || 0,
      missingVideoIds: values[7]?.trim() || ''
    })
  }

  return rows
}

async function getLanguageDataMap(): Promise<Map<string, LanguageData>> {
  console.log('  Fetching language BCP47 codes...')

  const languages = await languagesPrisma.language.findMany({
    select: {
      id: true,
      bcp47: true
    }
  })

  console.log(`  Loaded ${languages.length} languages`)
  console.log('  Fetching language names...')

  const languageNames = await languagesPrisma.languageName.findMany({
    where: {
      OR: [{ languageId: '529' }, { primary: true }]
    },
    select: {
      parentLanguageId: true,
      value: true,
      primary: true,
      languageId: true
    },
    orderBy: [
      { parentLanguageId: 'asc' },
      { primary: 'desc' },
      { languageId: 'asc' }
    ]
  })

  const nameMap = new Map<
    string,
    { value: string; isPrimary: boolean; isEnglish: boolean }
  >()

  for (const name of languageNames) {
    const existing = nameMap.get(name.parentLanguageId)
    const isPrimary = name.primary
    const isEnglish = name.languageId === '529'

    if (!existing) {
      nameMap.set(name.parentLanguageId, {
        value: name.value,
        isPrimary,
        isEnglish
      })
    } else {
      if (isPrimary && !existing.isPrimary) {
        nameMap.set(name.parentLanguageId, {
          value: name.value,
          isPrimary,
          isEnglish
        })
      } else if (isEnglish && !existing.isPrimary && !existing.isEnglish) {
        nameMap.set(name.parentLanguageId, {
          value: name.value,
          isPrimary,
          isEnglish
        })
      }
    }
  }

  const finalNameMap = new Map<string, string>()
  for (const [langId, data] of nameMap.entries()) {
    finalNameMap.set(langId, data.value)
  }

  const map = new Map<string, LanguageData>()
  for (const lang of languages) {
    map.set(lang.id, {
      bcp47: lang.bcp47,
      name: finalNameMap.get(lang.id) || null
    })
  }

  console.log(`  Loaded names for ${nameMap.size} languages`)
  return map
}

async function getProductionVersions(
  filmName: string,
  languageId: string
): Promise<Set<number>> {
  const filmConfig = FILM_CONFIGS.find((f) => f.name === filmName)
  if (!filmConfig) {
    return new Set()
  }

  const pattern = filmConfig.videoIdPattern.replace(/%/g, '')

  const variants = await mediaPrisma.videoVariant.findMany({
    where: {
      videoId: {
        contains: pattern
      },
      languageId: languageId
    },
    select: {
      version: true
    },
    distinct: ['version']
  })

  return new Set(variants.map((v) => v.version))
}

async function checkVersions(
  csvRows: CsvRow[],
  languageDataMap: Map<string, LanguageData>
): Promise<VersionMismatch[]> {
  const mismatches: VersionMismatch[] = []

  console.log(`\nChecking ${csvRows.length} CSV rows against production...`)

  // Group CSV rows by film:language to batch queries
  const groupedRows = new Map<string, CsvRow[]>()
  for (const row of csvRows) {
    const key = `${row.filmName}:${row.languageId}`
    if (!groupedRows.has(key)) {
      groupedRows.set(key, [])
    }
    groupedRows.get(key)!.push(row)
  }

  console.log(`  Found ${groupedRows.size} unique film:language combinations`)

  let processed = 0
  for (const [key, rows] of groupedRows.entries()) {
    processed++
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${groupedRows.size} combinations...`)
    }

    const [filmName, languageId] = key.split(':')
    const productionVersionsSet = await getProductionVersions(filmName, languageId)

    const languageData =
      languageDataMap.get(languageId) || { bcp47: null, name: null }
    
    // Use BCP47 from CSV if not in language data map
    const bcp47 = languageData.bcp47 || rows[0]?.languageBcp47 || null

    // Get unique CSV versions for this combo
    const csvVersions = [...new Set(rows.map((r) => r.version))].sort(
      (a, b) => a - b
    )

    // Find missing versions (in CSV but not in production)
    // Only check versions that are NOT 1 (since we don't care about 1s in prod that are in CSV)
    const missingVersions = csvVersions.filter(
      (v) => v !== 1 && !productionVersionsSet.has(v)
    )

    // Only add mismatch if there are missing versions
    if (missingVersions.length > 0) {
      const row = rows[0]
      const productionVersions = Array.from(productionVersionsSet).sort((a, b) => a - b)
      mismatches.push({
        filmName,
        languageId,
        languageBcp47: bcp47,
        languageName: languageData.name,
        csvVersions,
        productionVersions,
        missingVersions,
        reEncodeStarted: row.reEncodeStarted
      })
    }
  }

  return mismatches
}

function escapeCSVValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  const stringValue = String(value)
  
  // Always quote if contains comma, quote, newline, carriage return, or leading/trailing whitespace
  const needsQuoting = 
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r') ||
    /^\s|\s$/.test(stringValue)
  
  if (needsQuoting) {
    // Escape any existing quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

// Helper to format array values for CSV (always quotes if multiple values)
function formatArrayForCSV(arr: number[]): string {
  if (arr.length === 0) {
    return ''
  }
  const joined = arr.join(', ')
  // Always quote joined arrays since they contain commas when length > 1
  // Even single values should be quoted if they're from an array context to be safe
  return escapeCSVValue(joined)
}

function generateCSV(mismatches: VersionMismatch[]): string {
  const headers = [
    'Film Name',
    'Language ID',
    'Language Name',
    'Language BCP47',
    'CSV Versions',
    'Production Versions',
    '"Missing Versions (in CSV, not in prod)"',
    'ReEncodeStarted'
  ]

  const csvLines: string[] = [headers.join(',')]

  for (const mismatch of mismatches) {
    const values = [
      escapeCSVValue(mismatch.filmName),
      escapeCSVValue(mismatch.languageId),
      escapeCSVValue(mismatch.languageName),
      escapeCSVValue(mismatch.languageBcp47),
      formatArrayForCSV(mismatch.csvVersions),
      formatArrayForCSV(mismatch.productionVersions),
      formatArrayForCSV(mismatch.missingVersions),
      escapeCSVValue(mismatch.reEncodeStarted)
    ]
    csvLines.push(values.join(','))
  }

  return csvLines.join('\n')
}

async function main() {
  try {
    let csvFilePath = process.argv[2]

    // If no path provided, try default location
    if (!csvFilePath) {
      const defaultPath = join(
        process.cwd(),
        'tools',
        'Problem language versions from Post Production - Complete Version List.csv'
      )
      if (existsSync(defaultPath)) {
        csvFilePath = defaultPath
      } else {
        console.error('❌ Error: Please provide the path to the CSV file')
        console.error('Usage: npx ts-node tools/check-version-mismatches.ts [csv-file-path]')
        console.error(`\nDefault path not found: ${defaultPath}`)
        process.exit(1)
      }
    }

    // Check if file exists
    if (!existsSync(csvFilePath)) {
      console.error(`❌ Error: CSV file not found: ${csvFilePath}`)
      process.exit(1)
    }

    console.log('╔═══════════════════════════════════════════════════════╗')
    console.log('║  Version Mismatch Checker                            ║')
    console.log('╚═══════════════════════════════════════════════════════╝\n')

    console.log(`Reading CSV file: ${csvFilePath}`)
    const csvRows = await parseCSV(csvFilePath)
    console.log(`  Loaded ${csvRows.length} rows from CSV\n`)

    let languageDataMap: Map<string, LanguageData>
    try {
      languageDataMap = await getLanguageDataMap()
    } catch (error) {
      console.log('⚠️  Warning: Could not load language data from database')
      console.log('   Continuing with BCP47 codes from CSV only...\n')
      // Create empty map - we'll use BCP47 from CSV
      languageDataMap = new Map()
    }

    const mismatches = await checkVersions(csvRows, languageDataMap)

    // Sort by film name, then by language ID
    mismatches.sort((a, b) => {
      if (a.filmName !== b.filmName) {
        return a.filmName.localeCompare(b.filmName)
      }
      return a.languageId.localeCompare(b.languageId)
    })

    console.log('\n' + '─'.repeat(55))
    console.log('Generating report...')
    const csv = generateCSV(mismatches)

    const outputPath = join(
      process.cwd(),
      'tools',
      'version-mismatch-report.csv'
    )
    writeFileSync(outputPath, csv, 'utf-8')

    const totalMissingVersions = mismatches.reduce(
      (sum, m) => sum + m.missingVersions.length,
      0
    )

    console.log(`✅ Report generated successfully!`)
    console.log(`📄 Output: ${outputPath}`)
    console.log(`📊 Total film:language combinations with missing versions: ${mismatches.length}`)
    console.log(`   - Total missing versions (in CSV, not in prod, excluding version 1): ${totalMissingVersions}`)
    console.log(`📋 CSV rows checked: ${csvRows.length}`)
  } catch (error) {
    console.error('❌ Error checking versions:', error)
    throw error
  } finally {
    await mediaPrisma.$disconnect()
    await languagesPrisma.$disconnect()
  }
}

// Run the script
main()
