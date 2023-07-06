// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { float } from 'aws-sdk/clients/lightsail'
import { isEmpty } from 'lodash'
import fetch from 'node-fetch'
import slugify from 'slugify'
import { PrismaClient, Prisma } from '.prisma/api-languages-client'

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

interface Country {
  id: string
  name: Prisma.JsonObject[]
  population: number
  continent: Prisma.JsonObject[]
  slug: string
  languageIds: string[]
  latitude: float
  longitude: float
  image: string
}

interface MediaCountry {
  countryId: number
  name: string
  continentName: string
  metadataLanguageTag: string
  longitude: float
  latitude: float
  counts: {
    languageCount: {
      value: number
    }
    population: {
      value: number
    }
  }
  assets: {
    flagUrls: {
      png8: string
      webpLossy50: string
    }
  }
  languageIds: number[]
}

interface MetadataLanguageTag {
  tag: string
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

async function getCountries(language = 'en'): Promise<MediaCountry[]> {
  const response: {
    _embedded: { mediaCountries: MediaCountry[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-countries?limit=5000&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }&metadataLanguageTags=${language}&expand=languageIds`
    )
  ).json()
  return response._embedded.mediaCountries
}

const usedTitles: string[] = []

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

function digestCountries(countries: MediaCountry[]): Country[] {
  console.log('countries:', '529')
  const transformedCountries: Country[] = countries.map((country) => ({
    id: country.countryId.toString(),
    name: [{ value: country.name, languageId: '529', primary: true }],
    population: country.counts.population.value,
    continent: [
      { value: country.continentName, languageId: '529', primary: true }
    ],
    slug: getSeoSlug(country.name, usedTitles),
    languageIds: country.languageIds.map((l) => l.toString()),
    latitude: country.latitude,
    longitude: country.longitude,
    image: country.assets.flagUrls.png8
  }))
  return transformedCountries
}

function digestTranslatedCountries(
  countries: MediaCountry[],
  mappedCountries: Country[],
  languageId: string
): Country[] {
  if (languageId === '529') return mappedCountries
  console.log('countries:', languageId)
  const transformedCountries: Country[] = countries.map((country) => ({
    id: country.countryId.toString(),
    name: [
      {
        value: isEmpty(country.name) ? '' : country.name,
        languageId,
        primary: false
      }
    ],
    population: country.counts.population.value,
    continent: [
      {
        value: isEmpty(country.continentName) ? '' : country.continentName,
        languageId,
        primary: false
      }
    ],
    slug: isEmpty(country.name) ? '' : getSeoSlug(country.name, usedTitles),
    languageIds: country.languageIds.map((l) => l.toString()),
    latitude: country.latitude,
    longitude: country.longitude,
    image: country.assets.flagUrls.png8
  }))
  transformedCountries.forEach((country) => {
    const existing = mappedCountries.find((c) => c.id === country.id)
    if (existing == null) mappedCountries.push(country)
    else {
      if (country.name[0].value !== '') existing.name.push(country.name[0])
      if (country.continent[0].value !== '')
        existing.continent.push(country.continent[0])
    }
  })

  return mappedCountries
}

async function getMetadataLanguageTags(): Promise<MetadataLanguageTag[]> {
  const response: {
    _embedded: { metadataLanguageTags: MetadataLanguageTag[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/metadata-language-tags?limit=5000&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.metadataLanguageTags
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

  const countries = await getCountries()
  let mappedCountries = digestCountries(countries)

  const metadataLanguages = await getMetadataLanguageTags()
  for (const metaDataLanguage of metadataLanguages) {
    const languageId = mediaLanguages.find(
      (l) => l.bcp47 === metaDataLanguage.tag
    )?.languageId
    if (languageId == null) continue
    const translatedCountries = await getCountries(metaDataLanguage.tag)
    mappedCountries = digestTranslatedCountries(
      translatedCountries,
      mappedCountries,
      languageId.toString()
    )
  }
  for (const country of mappedCountries) {
    await prismaService.country.upsert({
      where: { id: country.id },
      create: country,
      update: country
    })
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
