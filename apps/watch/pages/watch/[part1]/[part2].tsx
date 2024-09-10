import { ApolloError, gql } from '@apollo/client'
import algoliasearch from 'algoliasearch'
import type { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'
import { InstantSearch } from 'react-instantsearch'

import type { GetVideoContent } from '../../../__generated__/GetVideoContent'
import type { VideoContentFields } from '../../../__generated__/VideoContentFields'
import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getFlags } from '../../../src/libs/getFlags'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { slugMap } from '../../../src/libs/slugMap'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'
import { VideoProvider } from '../../../src/libs/videoContext'

export const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`

interface Part2PageProps {
  content: VideoContentFields
}

const DynamicVideoContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContentPage" */
      '../../../src/components/VideoContentPage'
    )
)

const DynamicVideoContainerPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContainerPage" */
      '../../../src/components/VideoContainerPage'
    )
)

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

export default function Part2Page({ content }: Part2PageProps): ReactElement {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <InstantSearch insights searchClient={searchClient} indexName={indexName}>
      <SnackbarProvider>
        <LanguageProvider>
          <VideoProvider value={{ content }}>
            {content.variant?.hls != null ? (
              <DynamicVideoContentPage />
            ) : (
              <DynamicVideoContainerPage />
            )}
          </VideoProvider>
        </LanguageProvider>
      </SnackbarProvider>
    </InstantSearch>
  )
}

export const getStaticProps: GetStaticProps<Part2PageProps> = async (
  context
) => {
  const [contentId, contentIdExtension] = (
    context.params?.part1 as string
  ).split('.')
  const [languageId, languageIdExtension] = (
    context.params?.part2 as string
  ).split('.')

  if (contentIdExtension !== 'html' || languageIdExtension !== 'html')
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${encodeURIComponent(
          contentId
        )}.html/${languageId}.html`
      }
    }

  if (slugMap[languageId] != null)
    return {
      redirect: {
        permanent: false,
        destination: `/watch/${encodeURIComponent(contentId)}.html/${
          slugMap[languageId]
        }.html`
      }
    }

  const client = createApolloClient()
  try {
    const { data } = await client.query<GetVideoContent>({
      query: GET_VIDEO_CONTENT,
      variables: {
        id: `${contentId}/${languageId}`
      }
    })
    if (data.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }
    return {
      revalidate: 3600,
      props: {
        flags: await getFlags(),
        content: data.content,
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-watch'],
          i18nConfig
        ))
      }
    }
  } catch (error) {
    if (
      error instanceof ApolloError &&
      error.graphQLErrors.some(
        ({ extensions }) => extensions?.code === 'NOT_FOUND'
      )
    )
      return {
        revalidate: 1,
        notFound: true
      }
    throw error
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { part1: 'jesus.html', part2: 'english.html' } },
      {
        params: {
          part1: 'life-of-jesus-gospel-of-john.html',
          part2: 'english.html'
        }
      },
      {
        params: { part1: 'jesus-calms-the-storm.html', part2: 'english.html' }
      },
      { params: { part1: 'magdalena.html', part2: 'english.html' } },
      { params: { part1: 'reflections-of-hope.html', part2: 'english.html' } },
      {
        params: { part1: 'day-6-jesus-died-for-me.html', part2: 'english.html' }
      },
      { params: { part1: 'book-of-acts.html', part2: 'english.html' } },
      { params: { part1: 'wedding-in-cana.html', part2: 'english.html' } },
      { params: { part1: 'lumo.html', part2: 'english.html' } },
      {
        params: {
          part1: 'peter-miraculous-escape-from-prison.html',
          part2: 'english.html'
        }
      },
      {
        params: {
          part1: '8-days-with-jesus-who-is-jesus.html',
          part2: 'english.html'
        }
      },
      { params: { part1: 'chosen-witness.html', part2: 'english.html' } },
      {
        params: { part1: 'lumo-the-gospel-of-luke.html', part2: 'english.html' }
      },
      {
        params: {
          part1: 'storyclubs-jesus-and-zacchaeus.html',
          part2: 'english.html'
        }
      },
      { params: { part1: 'birth-of-jesus.html', part2: 'english.html' } },
      { params: { part1: 'fallingplates.html', part2: 'english.html' } },
      {
        params: {
          part1: 'paul-and-silas-in-prison.html',
          part2: 'english.html'
        }
      },
      { params: { part1: 'my-last-day.html', part2: 'english.html' } },
      { params: { part1: 'the-beginning.html', part2: 'english.html' } }
    ],
    fallback: 'blocking'
  }
}
