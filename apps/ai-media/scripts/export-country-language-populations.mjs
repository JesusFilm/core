import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
const ENGLISH_LANGUAGE_ID = '529'

if (!GATEWAY_URL) {
  console.error('Missing NEXT_PUBLIC_GATEWAY_URL env var.')
  process.exit(1)
}

const query = `
  query GetLanguagesWithGeo {
    languages(limit: 5000) {
      id
      slug
      nativeName: name(primary: true) {
        value
      }
      name(languageId: "${ENGLISH_LANGUAGE_ID}") {
        value
      }
      countryLanguages {
        speakers
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
`

const response = await fetch(GATEWAY_URL, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-graphql-client-name': 'ai-media'
  },
  body: JSON.stringify({ query })
})

if (!response.ok) {
  console.error(`Gateway error: ${response.status}`)
  process.exit(1)
}

const payload = await response.json()
const languages = payload?.data?.languages ?? []

const countryMap = new Map()

for (const language of languages) {
  const englishLabel = language?.name?.[0]?.value?.trim() ?? ''
  const nativeLabel = language?.nativeName?.[0]?.value?.trim() ?? ''
  const languageId = language?.id
  if (!languageId || (!englishLabel && !nativeLabel)) continue

  const countryLanguages = language?.countryLanguages ?? []
  for (const entry of countryLanguages) {
    const country = entry?.country
    if (!country?.id) continue

    const countryId = country.id
    const countryName = country?.name?.[0]?.value?.trim() ?? countryId
    const continentId = country?.continent?.id ?? ''
    const continentName =
      country?.continent?.name?.[0]?.value?.trim() ?? continentId
    const speakers = entry?.speakers ?? 0

    const bucket = countryMap.get(countryId) ?? {
      countryId,
      countryName,
      continentId,
      continentName,
      languages: []
    }

    bucket.languages.push({
      languageId,
      englishLabel,
      nativeLabel,
      population: speakers
    })

    countryMap.set(countryId, bucket)
  }
}

const result = Array.from(countryMap.values())
  .map((country) => ({
    ...country,
    languages: country.languages.sort((a, b) => b.population - a.population)
  }))
  .sort((a, b) => a.countryName.localeCompare(b.countryName))

const outputPath = resolve(
  process.cwd(),
  'apps/ai-media/country-language-populations.json'
)

await writeFile(outputPath, JSON.stringify(result, null, 2))

console.log(`Saved ${result.length} countries to ${outputPath}`)
