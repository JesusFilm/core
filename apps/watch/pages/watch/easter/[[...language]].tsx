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
  // Use the URL language parameter, or context.locale from Next.js, or default to English
  const languageParam = context.params?.language?.[0] ?? context.locale ?? 'en'
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
    bcp47ToSlugMap['id'] = 'indonesian'
    bcp47ToSlugMap['th'] = 'thai'
    bcp47ToSlugMap['ja'] = 'japanese'
    bcp47ToSlugMap['ko'] = 'korean'
    bcp47ToSlugMap['ru'] = 'russian'
    bcp47ToSlugMap['tr'] = 'turkish'
    bcp47ToSlugMap['zh'] = 'chinese-simplified'
    bcp47ToSlugMap['zh-Hans-CN'] = 'chinese-simplified'

    if (languageData?.languages) {
      languageData.languages.forEach((language) => {
        if (language.slug) {
          if (language.bcp47) {
            bcp47ToSlugMap[language.bcp47.toLowerCase()] = language.slug
          }
        }
      })
    }

    const languageSlug =
      bcp47ToSlugMap[languageParam.toLowerCase()] || 'english'

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
          context.locale ?? languageParam ?? 'en',
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
  // Get list of supported locales from next-i18next config
  const locales = [
    'en',
    'es',
    'fr',
    'id',
    'th',
    'ja',
    'ko',
    'ru',
    'tr',
    'zh',
    'zh-Hans-CN'
  ]

  // Create paths for all supported locales
  const paths: { params: { language: string[] }; locale: string }[] = []

  // Add default path with no language param
  paths.push({
    params: { language: [] },
    locale: 'en'
  })

  // Add paths for each locale
  locales.forEach((locale) => {
    // Create paths with the language parameter for each locale
    paths.push({
      params: { language: [locale] },
      locale
    })
  })

  return {
    paths,
    fallback: 'blocking' // Generate pages on-demand if not pre-rendered
  }
}
