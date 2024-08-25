import { z } from 'zod'

import { Prisma } from '.prisma/api-languages-client'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'

const languageSchema = z.object({
  id: z.number().transform(String),
  bcp47: z.string().nullable(),
  iso3: z.string().nullable(),
  hasVideos: z.number().transform(Boolean),
  updatedAt: z.object({ value: z.string() }).transform((value) => value.value)
})

let existingLanguageIds: string[]

const bigQueryTableName =
  'jfp-data-warehouse.jfp_mmdb_prod.core_languages_arclight_data'

export async function getExistingPrismaLanguageIds(): Promise<string[]> {
  const prismaLangages = await prisma.language.findMany({
    select: {
      id: true
    }
  })
  return prismaLangages.map(({ id }) => id)
}

export async function importLanguages(): Promise<string[]> {
  existingLanguageIds = await getExistingPrismaLanguageIds()
  await processTable(bigQueryTableName, importOne, importMany, true)
  return existingLanguageIds
}

export async function importOne(row: unknown): Promise<void> {
  const data = parse<Prisma.LanguageUncheckedCreateInput>(languageSchema, row)

  if (!existingLanguageIds.includes(data.id)) existingLanguageIds.push(data.id)

  await prisma.language.upsert({
    where: {
      id: data.id
    },
    update: data,
    create: data
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data, inValidRowIds } =
    parseMany<Prisma.LanguageUncheckedCreateInput>(languageSchema, rows)

  await prisma.language.createMany({
    data: data.filter(({ id }) => !existingLanguageIds.includes(id)),
    skipDuplicates: true
  })

  existingLanguageIds = existingLanguageIds.concat(data.map(({ id }) => id))

  if (data.length !== rows.length) {
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
  }
}

export function clearExistingLanguageIds(): void {
  existingLanguageIds = []
}
