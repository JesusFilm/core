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

const db = ArangoDB()

async function getLanguage(languageId: number): Promise<Language | undefined> {
  const rst = await db.query(aql`
  FOR item IN ${db.collection('languages')}
    FILTER item._key == ${languageId.toString()}
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

async function main(): Promise<void> {
  try {
    await db.createCollection('languages', { keyOptions: { type: 'uuid' } })
  } catch {}
  const collection = db.collection('languages')
  const data = await (
    await fetch(
      `https://api.arclight.org/v2/media-languages?limit=5000&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()

  for (const mediaLanguage of data._embedded.mediaLanguages) {
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
    const language = await getLanguage(languageId)

    if (language != null) {
      await collection.update(languageId.toString(), body)
    } else {
      await collection.save({ _key: languageId.toString(), ...body })
    }
  }

  for (const mediaLanguage of data._embedded.mediaLanguages) {
    const { languageId, metadataLanguageTag, name } = mediaLanguage
    const language = await getLanguage(languageId)
    if (language == null) continue

    const metadataLanguage = await getLanguageByBcp47(metadataLanguageTag)
    if (metadataLanguage == null) continue

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
    await collection.update(languageId.toString(), body)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
