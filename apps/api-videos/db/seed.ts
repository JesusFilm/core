// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { aql } from 'arangojs'
import { ArangoSearchViewPropertiesOptions } from 'arangojs/view'

import { fetchMediaComponentsAndTransformToVideos } from '../src/libs/arclight'
import {
  Video,
  fetchMediaLanguagesAndTransformToLanguages
} from '../src/libs/arclight/arclight'

import { ArangoDB } from './db'

const db = ArangoDB()

async function getVideo(
  videoId: string
): Promise<Record<string, unknown> | undefined> {
  const rst = await db.query(aql`
  FOR item IN ${db.collection('videos')}
    FILTER item._key == ${videoId}
    LIMIT 1
    RETURN item`)
  return await rst.next()
}

async function getVideoSlugs(): Promise<Record<string, string>> {
  const result = await db.query(aql`
    FOR video IN videos
    RETURN {
      slug: video.slug,
      _key: video._key
    }
  `)
  const results = await result.all()
  const slugs: Record<string, string> = {}
  for await (const video of results) {
    slugs[video.slug] = video._key
  }
  return slugs
}
async function importMediaComponents(): Promise<void> {
  const usedVideoSlugs: Record<string, string> = await getVideoSlugs()
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  let videos: Video[]
  let page = 1
  const startTime = new Date().getTime()
  do {
    videos = await fetchMediaComponentsAndTransformToVideos(
      languages,
      usedVideoSlugs,
      page
    )
    for (const video of videos) {
      if ((await getVideo(video._key)) != null) {
        await db.collection('videos').update(video._key, video)
      } else {
        await db.collection('videos').save(video)
      }
    }
    const duration = new Date().getTime() - startTime
    console.log('importMediaComponents duration(s):', duration * 0.001)
    console.log('importMediaComponents page:', page)
    page++
  } while (videos.length > 0)
}

async function main(): Promise<void> {
  if (!(await db.collection('videos').exists())) {
    await db.createCollection('videos', { keyOptions: { type: 'uuid' } })
  }

  await db.collection('videos').ensureIndex({
    name: 'language_id',
    type: 'persistent',
    fields: ['variants[*].languageId']
  })

  await db.collection('videos').ensureIndex({
    name: 'slug',
    type: 'persistent',
    fields: ['slug'],
    unique: true
  })

  await db.collection('videos').ensureIndex({
    name: 'variants_slug',
    type: 'persistent',
    fields: ['variants[*].slug'],
    unique: true
  })

  const view: ArangoSearchViewPropertiesOptions = {
    links: {
      videos: {
        fields: {
          _key: {
            analyzers: ['identity']
          },
          variants: {
            fields: {
              languageId: {
                analyzers: ['identity']
              },
              subtitle: {
                fields: {
                  languageId: {
                    analyzers: ['identity']
                  }
                }
              },
              slug: {
                analyzers: ['identity']
              }
            }
          },
          title: {
            fields: {
              value: {
                analyzers: ['text_en']
              }
            }
          },
          label: {
            analyzers: ['identity']
          },
          childIds: {
            analyzers: ['identity']
          },
          slug: {
            analyzers: ['identity']
          }
        }
      }
    }
  }
  if (await db.view('videosView').exists()) {
    console.log('updating view...')
    await db.view('videosView').updateProperties(view)
    console.log('view created')
  } else {
    console.log('creating view...')
    await db.createView('videosView', view)
    console.log('view created')
  }

  console.log('importing mediaComponents as videos...')
  await importMediaComponents()
  console.log('mediaComponents imported')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
