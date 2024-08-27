import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const languageSchema = z.object({
  id: z.number().transform(String),
  bcp47: z.string().nullable(),
  iso3: z.string().nullable(),
  hasVideos: z.number().transform(Boolean),
  updatedAt: z.object({ value: z.string() }).transform((value) => value.value)
})

let languageIds: string[] = []

export function setLanguageIds(languages: Array<{ id: string }>): void {
  languageIds = languages.map(({ id }) => id)
}

export function getLanguageIds(): string[] {
  return languageIds
}

export async function importLanguages(logger?: Logger): Promise<() => void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_languages_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
  setLanguageIds(
    await prisma.language.findMany({
      select: {
        id: true
      }
    })
  )
  return () => {
    setLanguageIds([])
  }
}

export async function importOne(row: unknown): Promise<void> {
  const language = parse(languageSchema, row)

  await prisma.language.upsert({
    where: {
      id: language.id
    },
    update: language,
    create: language
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: languages, inValidRowIds } = parseMany(languageSchema, rows)

  if (languages.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.language.createMany({
    data: languages,
    skipDuplicates: true
  })
}
