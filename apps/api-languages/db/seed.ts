import { aql } from 'arangojs'
import { isEmpty } from 'lodash'
import fetch from 'node-fetch'
import { ArangoDB } from './db'

interface Language {
  _key: string
  name: Array<{ value: string; languageId: string; primary: boolean }>
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

const db = ArangoDB()

async function getLanguage(languageId: string): Promise<Language | undefined> {
  const rst = await db.query(aql`
  FOR item IN ${db.collection('languages')}
    FILTER item._key == ${languageId}
    LIMIT 1
    RETURN item`)
  return await rst.next()
}

async function getLanguageByBcp47(
  bcp47: string
): Promise<Language | undefined> {
  const rst = await db.query(aql`
  FOR item IN ${db.collection('languages')}
    FILTER item.bcp47 == ${bcp47}
    LIMIT 1
    RETURN item`)
  return await rst.next()
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
  const body: Omit<Language, '_key'> = {
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
  const language = await getLanguage(languageId.toString())

  if (language != null) {
    await db.collection('languages').update(languageId.toString(), body)
  } else {
    await db
      .collection('languages')
      .save({ _key: languageId.toString(), ...body })
  }
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
      ({ languageId }) => languageId === metadataLanguage._key
    ) != null
  )
    return

  const body: Omit<Language, '_key'> = {
    name: [
      ...language.name,
      {
        value: name,
        languageId: metadataLanguage._key,
        primary: false
      }
    ]
  }
  await db.collection('languages').update(languageId.toString(), body)
}

async function main(): Promise<void> {
  try {
    await db.createCollection('languages', { keyOptions: { type: 'uuid' } })
  } catch {}
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
