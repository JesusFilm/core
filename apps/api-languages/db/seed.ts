import { aql } from 'arangojs'
import { isEmpty } from 'lodash'
import fetch from 'node-fetch'
import { ArangoDB } from './db'

interface Language {
  _key: string
}

const db = ArangoDB()

async function main(): Promise<void> {
  try {
    await db.createCollection('languages', { keyOptions: { type: 'uuid' } })
  } catch {}
  const collection = db.collection('languages')
  const data = await (
    await fetch(
      'https://api.arclight.org/v2/media-languages?page=1&limit=5000&filter=default&apiKey=50105582a2e5a6.72068725'
    )
  ).json()

  async function getLanguage(
    languageId: number
  ): Promise<Language | undefined> {
    const rst = await db.query(aql`
    FOR item IN ${collection}
      FILTER item._key == ${languageId.toString()}
      LIMIT 1
      RETURN item`)
    return await rst.next()
  }

  async function getLanguageByBcp47(
    bcp47: string
  ): Promise<Language | undefined> {
    const rst = await db.query(aql`
    FOR item IN ${collection}
      FILTER item.bcp47 == ${bcp47}
      LIMIT 1
      RETURN item`)
    return await rst.next()
  }

  for (const mediaLanguage of data._embedded.mediaLanguages) {
    const { languageId, bcp47, iso3, nameNative } = mediaLanguage
    const body = {
      bcp47: isEmpty(bcp47) ? undefined : bcp47,
      iso3: isEmpty(iso3) ? undefined : iso3,
      nameNative
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
    const metadataLanguage = await getLanguageByBcp47(metadataLanguageTag)
    if (metadataLanguage == null) continue
    const body = {
      names: [
        {
          name,
          languageId: metadataLanguage._key
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
