// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import isEmpty from 'lodash/isEmpty'
import fetch from 'node-fetch'
import slugify from 'slugify'

import {
  LanguageName,
  Prisma,
  PrismaClient
} from '.prisma/api-languages-client'
import { Translation } from '@core/nest/common/TranslationModule'

const prismaService = new PrismaClient()

interface Language {
  id: string
  name: LanguageName[]
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

interface MediaCountry {
  countryId: number
  name: string
  continentName: string
  metadataLanguageTag: string
  longitude: number
  latitude: number
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
    where: { id: languageId },
    include: { name: true }
  })

  return result as unknown as Language
}

async function getLanguageByBcp47(bcp47: string): Promise<Language | null> {
  const result = await prismaService.language.findFirst({
    where: { bcp47 },
    include: { name: true }
  })
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

async function digestMediaLanguage(
  mediaLanguage: MediaLanguage
): Promise<void> {
  const { languageId, bcp47, iso3, nameNative } = mediaLanguage
  const body = {
    bcp47: isEmpty(bcp47) ? undefined : bcp47,
    iso3: isEmpty(iso3) ? undefined : iso3
  }

  const primaryName = {
    parentLanguageId: languageId.toString(),
    value: nameNative,
    languageId: languageId.toString(),
    primary: true
  }

  await prismaService.language.upsert({
    where: { id: languageId.toString() },
    update: body,
    create: { id: languageId.toString(), ...body }
  })

  await prismaService.languageName.upsert({
    where: {
      parentLanguageId_languageId: {
        parentLanguageId: languageId.toString(),
        languageId: languageId.toString()
      }
    },
    update: primaryName,
    create: primaryName
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

  await prismaService.languageName.upsert({
    where: {
      parentLanguageId_languageId: {
        parentLanguageId: languageId.toString(),
        languageId: metadataLanguage.id
      }
    },
    update: {
      value: name,
      primary: false
    },
    create: {
      parentLanguageId: languageId.toString(),
      value: name,
      languageId: metadataLanguage.id,
      primary: false
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

interface TransformedCountries
  extends Omit<Prisma.CountryCreateInput, 'name' | 'continent'> {
  names: Translation[]
  continents: Translation[]
}

function digestCountries(countries: MediaCountry[]): TransformedCountries[] {
  console.log('countries:', '529')
  const transformedCountries = countries.map((country) => ({
    id: country.countryId.toString(),
    names: [{ value: country.name, languageId: '529', primary: true }],
    population: country.counts.population.value,
    continents: [
      { value: country.continentName, languageId: '529', primary: true }
    ],
    languageIds: country.languageIds.map((l) => l.toString()),
    latitude: country.latitude,
    longitude: country.longitude,
    flagPngSrc: country.assets.flagUrls.png8,
    flagWebpSrc: country.assets.flagUrls.webpLossy50
  }))
  return transformedCountries
}

function digestTranslatedCountries(
  countries: MediaCountry[],
  mappedCountries: TransformedCountries[],
  languageId: string
): TransformedCountries[] {
  if (languageId === '529') return mappedCountries
  console.log('countries:', languageId)
  const transformedCountries: TransformedCountries[] = countries.map(
    (country) => ({
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
      slug: [
        {
          value: isEmpty(country.name)
            ? ''
            : getSeoSlug(country.name, usedTitles),
          languageId,
          primary: false
        }
      ],
      languageIds: country.languageIds.map((l) => l.toString()),
      latitude: country.latitude,
      longitude: country.longitude,
      image: country.assets.flagUrls.png8
    })
  )
  transformedCountries.forEach((country) => {
    const existing = mappedCountries.find((c) => c._key === country._key)
    if (existing == null) mappedCountries.push(country)
    else {
      if (country.name[0].value !== '') existing.name.push(country.name[0])
      if (country.continent[0].value !== '')
        existing.continent.push(country.continent[0])
      if (country.slug[0].value !== '') existing.slug.push(country.slug[0])
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
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
