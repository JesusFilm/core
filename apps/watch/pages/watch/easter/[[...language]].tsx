import { ApolloError, gql } from '@apollo/client'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import type { GetLanguagesWithBcp47 } from '../../../__generated__/GetLanguagesWithBcp47'
import type {
  GetVideoContent,
  GetVideoContentVariables
} from '../../../__generated__/GetVideoContent'
import type { VideoContentFields } from '../../../__generated__/VideoContentFields'
import i18nConfig from '../../../next-i18next.config'
import { CollectionsPage } from '../../../src/components/CollectionsPage'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { getFlags } from '../../../src/libs/getFlags'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../src/libs/videoContext'
import { GET_VIDEO_CONTENT } from '../[part1]/[part2]'

const GET_LANGUAGES_WITH_BCP47 = gql`
  query GetLanguagesWithBcp47 {
    languages(limit: 5000) {
      id
      slug
      bcp47
      name(languageId: "529", primary: true) {
        value
        primary
      }
    }
  }
`

interface EasterPageProps {
  content: VideoContentFields
}

export default function EasterPage({ content }: EasterPageProps): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content }}>
          <CollectionsPage />
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}

export const getStaticProps: GetStaticProps<EasterPageProps> = async (
  context
) => {
  const languageParam = context.params?.language?.[0] ?? 'en'
  const contentId = 'easter'

  const client = createApolloClient()

  try {
    const { data: languageData } = await client.query<GetLanguagesWithBcp47>({
      query: GET_LANGUAGES_WITH_BCP47
    })

    const bcp47ToSlugMap: Record<string, string> = {}

    // Fallback mappings to ensure critical languages always work
    bcp47ToSlugMap['en'] = 'english'
    bcp47ToSlugMap['fr'] = 'french'
    bcp47ToSlugMap['es'] = 'spanish-latin-american'

    if (languageData?.languages) {
      languageData.languages.forEach((language) => {
        if (language.slug) {
          if (language.bcp47) {
            bcp47ToSlugMap[language.bcp47.toLowerCase()] = language.slug
          }
        }
      })
    }

    const languageSlug = bcp47ToSlugMap[languageParam.toLowerCase()]

    const { data } = await client.query<
      GetVideoContent,
      GetVideoContentVariables
    >({
      query: GET_VIDEO_CONTENT,
      variables: {
        id: `${contentId}/${languageSlug}`
      }
    })

    if (data.content == null) {
      return {
        revalidate: 1,
        notFound: true
      }
    }

    return {
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
        ({ extensions, message }) =>
          extensions?.code === 'NOT_FOUND' ||
          message?.startsWith('Video not found')
      )
    )
      console.error(error)
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
      { params: { language: [] } }, // Default English version
      { params: { language: ['fr'] } },
      { params: { language: ['es'] } }
    ],
    fallback: 'blocking'
  }
}
