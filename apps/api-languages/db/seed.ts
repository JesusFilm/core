// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import isEmpty from 'lodash/isEmpty'
import fetch from 'node-fetch'
import slugify from 'slugify'

import { Prisma, PrismaClient } from '.prisma/api-languages-client'

const prismaService = new PrismaClient()

interface Language {
  id: string
  name: Prisma.JsonObject[]
  bcp47?: string
  iso3?: string
}

interface MediaLanguage {
  languageId: number
  bcp47?: string
  iso3?: string
  nameNative: string
  metadataLanguageTag: string
  name: string
}

async function getLanguage(languageId: string): Promise<Language | null> {
  const result = await prismaService.language.findUnique({
    where: { id: languageId }
  })

  return result as unknown as Language
}

async function getLanguageByBcp47(bcp47: string): Promise<Language | null> {
  const result = await prismaService.language.findFirst({ where: { bcp47 } })
  return result as unknown as Language
}

async function getMediaLanguages(): Promise<MediaLanguage[]> {
  const response: {
    _embedded: { mediaLanguages: MediaLanguage[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-languages?limit=5000&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaLanguages
}

async function digestMediaLanguage(
  mediaLanguage: MediaLanguage
): Promise<void> {
  const { languageId, bcp47, iso3, nameNative } = mediaLanguage
  const body = {
    bcp47: isEmpty(bcp47) ? undefined : bcp47,
    iso3: isEmpty(iso3) ? undefined : iso3,
    name: [
      {
        value: nameNative,
        languageId: languageId.toString(),
        primary: true
      }
    ]
  }

  await prismaService.language.upsert({
    where: { id: languageId.toString() },
    update: body,
    create: { id: languageId.toString(), ...body }
  })
}

async function digestMediaLanguageMetadata(
  mediaLanguage: MediaLanguage
): Promise<void> {
  const { languageId, metadataLanguageTag, name } = mediaLanguage
  console.log(
    'digestMediaLanguageMetadata',
    `${languageId}-${metadataLanguageTag}`
  )
  const language = await getLanguage(languageId.toString())
  if (language == null) return

  const metadataLanguage = await getLanguageByBcp47(metadataLanguageTag)
  if (metadataLanguage == null) return

  if (
    language.name.find(
      ({ languageId }) => languageId === metadataLanguage.id
    ) != null
  )
    return

  await prismaService.language.update({
    where: { id: languageId.toString() },
    data: {
      name: [
        ...language.name,
        {
          value: name,
          languageId: metadataLanguage.id,
          primary: false
        }
      ]
    }
  })
}

export function getIteration(slug: string, collection: string[]): string {
  const exists = collection.find((t) => t === slug)
  if (exists != null && slug !== '') {
    const regex = slug.match(/^(.*?)-(\d+)$/)
    const iteration = parseInt(regex?.[2] ?? '1') + 1
    const title = regex?.[1] ?? slug
    const value = `${title}-${iteration}`
    return getIteration(value, collection)
  }
  return slug
}

export function getSeoSlug(title: string, collection: string[]): string {
  const slug = slugify(title, { lower: true, remove: /[^a-zA-Z\d\s:]/g })
  const newSlug = getIteration(slug, collection)
  collection.push(newSlug)
  return newSlug
}

async function main(): Promise<void> {
  const mediaLanguages = await getMediaLanguages()

  for (const mediaLanguage of mediaLanguages) {
    console.log('language:', mediaLanguage.languageId)
    await digestMediaLanguage(mediaLanguage)
  }

  for (const mediaLanguage of mediaLanguages) {
    await digestMediaLanguageMetadata(mediaLanguage)
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
