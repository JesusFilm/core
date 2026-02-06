import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
const ENGLISH_LANGUAGE_ID = '529'
const COUNTRY_LANGUAGE_POPULATIONS_FILE = 'country-language-populations.json'
const COUNTRY_LANGUAGE_POPULATIONS_PATHS = [
  resolve(
    process.cwd(),
    'apps/ai-media',
    COUNTRY_LANGUAGE_POPULATIONS_FILE
  ),
  resolve(process.cwd(), COUNTRY_LANGUAGE_POPULATIONS_FILE)
]

type GeoContinent = {
  id: string
  name: string
}

type GeoCountry = {
  id: string
  name: string
  continentId: string
}

type GeoLanguage = {
  id: string
  englishLabel: string
  nativeLabel: string
  countryIds: string[]
  continentIds: string[]
  countrySpeakers: Record<string, number>
}

type GeoPayload = {
  continents: GeoContinent[]
  countries: GeoCountry[]
  languages: GeoLanguage[]
}

type CountryLanguagePopulationRow = {
  languageId?: string
  englishLabel?: string
  nativeLabel?: string
  population?: number
}

type CountryLanguagePopulationCountry = {
  countryId?: string
  countryName?: string
  continentId?: string
  continentName?: string
  languages?: CountryLanguagePopulationRow[]
}

type MutableLanguage = {
  id: string
  englishLabel: string
  nativeLabel: string
  countryIds: Set<string>
  continentIds: Set<string>
  countrySpeakers: Record<string, number>
}

type GraphqlLanguage = {
  id: string
  nativeName?: Array<{ value: string }>
  name?: Array<{ value: string }>
  countryLanguages?: Array<{
    speakers?: number | null
    displaySpeakers?: number | null
    country?: {
      id: string
      name?: Array<{ value: string }>
      continent?: {
        id: string
        name?: Array<{ value: string }>
      }
    }
  }>
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

function createEmptyPayload(): GeoPayload {
  return {
    continents: [],
    countries: [],
    languages: []
  }
}

function toSortedPayload(
  continentsMap: Map<string, GeoContinent>,
  countriesMap: Map<string, GeoCountry>,
  languagesMap: Map<string, MutableLanguage>
): GeoPayload {
  const continents = Array.from(continentsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const countries = Array.from(countriesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const languages = Array.from(languagesMap.values())
    .map((language) => ({
      id: language.id,
      englishLabel: language.englishLabel,
      nativeLabel: language.nativeLabel,
      countryIds: Array.from(language.countryIds),
      continentIds: Array.from(language.continentIds),
      countrySpeakers: language.countrySpeakers
    }))
    .sort((a, b) => a.englishLabel.localeCompare(b.englishLabel))

  return {
    continents,
    countries,
    languages
  }
}

function ensureLanguageBucket(
  languagesMap: Map<string, MutableLanguage>,
  id: string,
  englishLabel: string,
  nativeLabel: string
): MutableLanguage {
  const existing = languagesMap.get(id)
  if (existing) {
    if (!existing.englishLabel && englishLabel) {
      existing.englishLabel = englishLabel
    }
    if (!existing.nativeLabel && nativeLabel) {
      existing.nativeLabel = nativeLabel
    }
    return existing
  }

  const next: MutableLanguage = {
    id,
    englishLabel,
    nativeLabel,
    countryIds: new Set<string>(),
    continentIds: new Set<string>(),
    countrySpeakers: {}
  }
  languagesMap.set(id, next)
  return next
}

async function loadGeoPayloadFromLocalJson(): Promise<GeoPayload> {
  let raw: string | null = null

  for (const filePath of COUNTRY_LANGUAGE_POPULATIONS_PATHS) {
    try {
      raw = await readFile(filePath, 'utf8')
      break
    } catch (error) {
      const errno = (error as NodeJS.ErrnoException)?.code
      if (errno !== 'ENOENT') throw error
    }
  }

  if (raw == null) {
    throw new Error('Unable to find country-language-populations.json')
  }

  const countryRows = JSON.parse(raw) as CountryLanguagePopulationCountry[]

  const continentsMap = new Map<string, GeoContinent>()
  const countriesMap = new Map<string, GeoCountry>()
  const languagesMap = new Map<string, MutableLanguage>()

  for (const country of countryRows) {
    const countryId = country.countryId?.trim() ?? ''
    if (!countryId) continue

    const countryName = country.countryName?.trim() || countryId
    const continentId = country.continentId?.trim() ?? ''
    const continentName = country.continentName?.trim() || continentId

    if (continentId && !continentsMap.has(continentId)) {
      continentsMap.set(continentId, { id: continentId, name: continentName })
    }

    if (!countriesMap.has(countryId)) {
      countriesMap.set(countryId, {
        id: countryId,
        name: countryName,
        continentId
      })
    }

    for (const language of country.languages ?? []) {
      const languageId = language.languageId?.trim() ?? ''
      if (!languageId) continue

      const englishLabel = language.englishLabel?.trim() ?? ''
      const nativeLabel = language.nativeLabel?.trim() ?? ''
      const population =
        typeof language.population === 'number' &&
        Number.isFinite(language.population)
          ? Math.max(0, Math.round(language.population))
          : 0

      const bucket = ensureLanguageBucket(
        languagesMap,
        languageId,
        englishLabel,
        nativeLabel
      )

      bucket.countryIds.add(countryId)
      if (continentId) {
        bucket.continentIds.add(continentId)
      }

      const existingCount = bucket.countrySpeakers[countryId] ?? 0
      if (population > existingCount) {
        bucket.countrySpeakers[countryId] = population
      }
    }
  }

  return toSortedPayload(continentsMap, countriesMap, languagesMap)
}

function filterPayloadBySearch(
  payload: GeoPayload,
  rawSearch: string
): GeoPayload {
  const search = normalizeText(rawSearch)
  if (!search) return payload

  const matchedLanguages = payload.languages.filter((language) => {
    const english = normalizeText(language.englishLabel)
    const native = normalizeText(language.nativeLabel)
    return english.includes(search) || native.includes(search)
  })

  if (matchedLanguages.length === 0) {
    return createEmptyPayload()
  }

  const countryIds = new Set<string>()
  const continentIds = new Set<string>()

  for (const language of matchedLanguages) {
    for (const countryId of language.countryIds) {
      countryIds.add(countryId)
    }
    for (const continentId of language.continentIds) {
      continentIds.add(continentId)
    }
  }

  const countries = payload.countries.filter((country) =>
    countryIds.has(country.id)
  )
  const continents = payload.continents.filter((continent) =>
    continentIds.has(continent.id)
  )

  return {
    continents,
    countries,
    languages: matchedLanguages
  }
}

async function searchLanguagesFromGraphql(search: string): Promise<GeoPayload> {
  if (!GATEWAY_URL) return createEmptyPayload()

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-graphql-client-name': 'ai-media'
    },
    body: JSON.stringify({
      query: `
        query SearchLanguagesWithGeo($term: String!) {
          languages(limit: 100, term: $term) {
            id
            nativeName: name(primary: true) {
              value
            }
            name(languageId: "${ENGLISH_LANGUAGE_ID}") {
              value
            }
            countryLanguages {
              speakers
              displaySpeakers
              country {
                id
                name(languageId: "${ENGLISH_LANGUAGE_ID}") {
                  value
                }
                continent {
                  id
                  name(languageId: "${ENGLISH_LANGUAGE_ID}") {
                    value
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        term: search
      }
    }),
    cache: 'no-store'
  })

  if (!response.ok) {
    return createEmptyPayload()
  }

  const payload = (await response.json()) as {
    data?: {
      languages?: GraphqlLanguage[]
    }
  }

  const continentsMap = new Map<string, GeoContinent>()
  const countriesMap = new Map<string, GeoCountry>()
  const languagesMap = new Map<string, MutableLanguage>()

  for (const language of payload.data?.languages ?? []) {
    const languageId = language.id?.trim()
    if (!languageId) continue

    const englishLabel = language.name?.[0]?.value?.trim() ?? ''
    const nativeLabel = language.nativeName?.[0]?.value?.trim() ?? ''
    if (!englishLabel && !nativeLabel) continue

    const bucket = ensureLanguageBucket(
      languagesMap,
      languageId,
      englishLabel,
      nativeLabel
    )

    for (const entry of language.countryLanguages ?? []) {
      const country = entry.country
      if (!country?.id) continue

      const countryId = country.id
      const countryName = country.name?.[0]?.value?.trim() || countryId
      const continentId = country.continent?.id ?? ''
      const continentName =
        country.continent?.name?.[0]?.value?.trim() || continentId

      if (!countriesMap.has(countryId)) {
        countriesMap.set(countryId, {
          id: countryId,
          name: countryName,
          continentId
        })
      }
      if (continentId && !continentsMap.has(continentId)) {
        continentsMap.set(continentId, {
          id: continentId,
          name: continentName
        })
      }

      const displaySpeakers =
        typeof entry.displaySpeakers === 'number' &&
        Number.isFinite(entry.displaySpeakers)
          ? entry.displaySpeakers
          : null
      const speakers =
        typeof entry.speakers === 'number' && Number.isFinite(entry.speakers)
          ? entry.speakers
          : null
      const estimate = Math.max(
        0,
        Math.round(
          displaySpeakers != null && displaySpeakers > 0
            ? displaySpeakers
            : (speakers ?? 0)
        )
      )

      bucket.countryIds.add(countryId)
      if (continentId) {
        bucket.continentIds.add(continentId)
      }

      const existingEstimate = bucket.countrySpeakers[countryId] ?? 0
      if (estimate > existingEstimate) {
        bucket.countrySpeakers[countryId] = estimate
      }
    }
  }

  return toSortedPayload(continentsMap, countriesMap, languagesMap)
}

export async function GET(request: Request) {
  let localPayload: GeoPayload

  try {
    localPayload = await loadGeoPayloadFromLocalJson()
  } catch {
    return NextResponse.json(
      { error: 'Failed to load local country-language populations.' },
      { status: 500 }
    )
  }

  const search = new URL(request.url).searchParams.get('search')?.trim() ?? ''
  if (!search) {
    return NextResponse.json(localPayload)
  }

  const localMatches = filterPayloadBySearch(localPayload, search)
  if (localMatches.languages.length > 0) {
    return NextResponse.json(localMatches)
  }

  const remoteMatches = await searchLanguagesFromGraphql(search)
  const filteredRemoteMatches = filterPayloadBySearch(remoteMatches, search)
  return NextResponse.json(filteredRemoteMatches)
}
