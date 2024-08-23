import { ApolloClient, InMemoryCache } from '@apollo/client'
import algoliasearch from 'algoliasearch'
import { graphql } from 'gql.tada'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

const ENGLISH_LANGUAGE_ID = '529'
const SPANISH_CASTILIAN_LANGUAGE_ID = '21046'
const SPANISH_LATIN_AMERICAN_LANGUAGE_ID = '21028'
const CHINESE_TRADITIONAL_LANGUAGE_ID = '21753'
const CHINESE_SIMPLIFIED_LANGUAGE_ID = '21754'
const CHINESE_MANDARIN_LANGUAGE_ID = '20615'
const CHINESE_CANTONESE_LANGUAGE_ID = '20601'

export const GET_LANGUAGES = graphql(`
  query getLanguages {
    languages {
      id
      name(languageId: "529", primary: true) {
        value
        primary
        language {
          id
        }
      }
    }
  }
`)

export const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache()
})

interface LanguageRecord {
  [key: string]: {
    english: string | undefined
    primary: string | undefined
  }
}

async function getLanguages(logger?: Logger): Promise<LanguageRecord> {
  try {
    const { data } = await apollo.query({
      query: GET_LANGUAGES
    })

    const languagesRecord: LanguageRecord = {}
    data.languages.forEach((language) => {
      languagesRecord[language.id] = {
        english: language.name.find(({ language }) => language.id === '529')
          ?.value,
        primary: language.name.find(({ primary }) => primary)?.value
      }
    })

    return languagesRecord
  } catch (error) {
    logger?.error(error, 'unable to get languages from gateway')
    return {}
  }
}

export async function service(logger?: Logger): Promise<void> {
  const apiKey = process.env.ALGOLIA_API_KEY ?? ''
  const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
  const appIndex = process.env.ALGOLIA_INDEX ?? ''

  if (apiKey === '' || appId === '' || appIndex === '')
    throw new Error('algolia environment variables not set')

  logger?.info('getting languages from gateway')
  const languages = await getLanguages(logger)

  const client = algoliasearch(appId, apiKey)

  let offset = 0

  while (true) {
    try {
      const videoVariants = await prisma.videoVariant.findMany({
        take: 1000,
        skip: offset,
        include: {
          video: {
            include: {
              title: true,
              description: true,
              imageAlt: true,
              snippet: true
            }
          },
          subtitle: true
        },
        where:
          appIndex === 'video-variants-prd'
            ? undefined
            : {
                languageId: {
                  in: [
                    ENGLISH_LANGUAGE_ID,
                    SPANISH_CASTILIAN_LANGUAGE_ID,
                    SPANISH_LATIN_AMERICAN_LANGUAGE_ID,
                    CHINESE_TRADITIONAL_LANGUAGE_ID,
                    CHINESE_SIMPLIFIED_LANGUAGE_ID,
                    CHINESE_MANDARIN_LANGUAGE_ID,
                    CHINESE_CANTONESE_LANGUAGE_ID
                  ]
                }
              }
      })

      if (videoVariants.length === 0) {
        break
      }

      const transformedVideos = videoVariants.map((videoVariant) => {
        return {
          objectID: videoVariant.id,
          videoId: videoVariant.videoId,
          titles: videoVariant.video?.title.map((title) => title?.value),
          description: videoVariant.video?.description?.map(
            (description) => description?.value
          ),
          duration: videoVariant.duration,
          languageId: videoVariant.languageId,
          languageEnglishName: languages[videoVariant.languageId]?.english,
          languagePrimaryName: languages[videoVariant.languageId]?.primary,
          subtitles: videoVariant.subtitle.map(
            (subtitle) => subtitle.languageId
          ),
          slug: videoVariant.slug,
          label: videoVariant.video?.label,
          image: videoVariant.video?.image,
          imageAlt:
            videoVariant.video?.imageAlt.find((alt) => alt.languageId === '529')
              ?.value ?? '',
          childrenCount: videoVariant.video?.childIds.length
        }
      })

      const index = client.initIndex(appIndex)
      try {
        await index.saveObjects(transformedVideos).wait()
        logger?.info(`exported ${offset} videos to algolia`)
      } catch (error) {
        logger?.error(error, 'unable to export videos to algolia')
      }

      offset += 1000
    } catch (error) {
      logger?.error(error, 'unable to complete video processing loop')
      break
    }
  }
}
