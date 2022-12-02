import { aql } from 'arangojs'
import { fetchMediaComponentsAndTransformToVideos } from '../src/libs/arclight'
import {
  fetchMediaLanguagesAndTransformToLanguages,
  Video
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

async function importMediaComponents(): Promise<void> {
  const usedVideoSlugs = []
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  let videos: Video[]
  let page = 1
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

  const view = {
    links: {
      videos: {
        fields: {
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
                fields: {
                  value: {
                    analyzers: ['identity']
                  }
                }
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
            fields: {
              value: {
                analyzers: ['identity']
              }
            }
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

  await db.collection('videos').ensureIndex({
    name: 'slug',
    type: 'persistent',
    fields: ['slug[*].value'],
    unique: true
  })
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
