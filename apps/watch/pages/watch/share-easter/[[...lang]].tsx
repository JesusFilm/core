import type { GetStaticPaths, GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import {
  VideoLabel,
  VideoVariantDownloadQuality
} from '../../../__generated__/globalTypes'
import i18nConfig from '../../../next-i18next.config'
import { getFlags } from '../../../src/libs/getFlags'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../src/libs/videoContext'

interface ShareEasterPageProps {
  content: {
    __typename: 'Video'
    id: string
    label: VideoLabel
    images: Array<{
      __typename: 'CloudflareImage'
      mobileCinematicHigh: string
    }>
    imageAlt: Array<{
      __typename: 'VideoImageAlt'
      value: string
    }>
    snippet: Array<{
      __typename: 'VideoSnippet'
      value: string
    }>
    description: Array<{
      __typename: 'VideoDescription'
      value: string
    }>
    studyQuestions: Array<{
      __typename: 'VideoStudyQuestion'
      value: string
    }>
    title: Array<{
      __typename: 'VideoTitle'
      value: string
    }>
    variant: {
      __typename: 'VideoVariant'
      id: string
      duration: number
      hls: string | null
      downloadable: boolean
      downloads: Array<{
        __typename: 'VideoVariantDownload'
        quality: VideoVariantDownloadQuality
        size: number
        url: string
      }>
      language: {
        __typename: 'Language'
        id: string
        name: Array<{
          __typename: 'LanguageName'
          value: string
          primary: boolean
        }>
        bcp47: string
      }
      slug: string
      subtitleCount: number
    } | null
    variantLanguagesCount: number
    slug: string
    childrenCount: number
  }
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

export default function ShareEasterPage({
  content
}: ShareEasterPageProps): ReactElement {
  return (
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
  )
}

export const getStaticProps: GetStaticProps<ShareEasterPageProps> = async (
  context
) => {
  const lang = context.params?.lang?.[0] ?? 'english'

  // Static content for the share easter page
  const staticContent = {
    __typename: 'Video' as const,
    id: 'share-easter',
    label: VideoLabel.collection,
    images: [
      {
        __typename: 'CloudflareImage' as const,
        mobileCinematicHigh: '/images/share-easter-banner.jpg'
      }
    ],
    imageAlt: [
      {
        __typename: 'VideoImageAlt' as const,
        value: 'Share Easter'
      }
    ],
    snippet: [
      {
        __typename: 'VideoSnippet' as const,
        value: 'Share the Easter story with your friends and family'
      }
    ],
    description: [
      {
        __typename: 'VideoDescription' as const,
        value: 'A collection of videos to help you share the Easter story'
      }
    ],
    studyQuestions: [],
    title: [
      {
        __typename: 'VideoTitle' as const,
        value: 'Share Easter'
      }
    ],
    variant: {
      __typename: 'VideoVariant' as const,
      id: `share-easter-${lang}`,
      duration: 0,
      hls: null,
      downloadable: false,
      downloads: [],
      language: {
        __typename: 'Language' as const,
        id: lang,
        name: [
          {
            __typename: 'LanguageName' as const,
            value:
              lang === 'english'
                ? 'English'
                : lang === 'fr'
                  ? 'Français'
                  : 'Español',
            primary: true
          }
        ],
        bcp47: lang === 'english' ? 'en' : lang === 'fr' ? 'fr' : 'es'
      },
      slug: `share-easter/${lang}`,
      subtitleCount: 0
    },
    variantLanguagesCount: 3,
    slug: 'share-easter',
    childrenCount: 0
  }

  return {
    props: {
      flags: await getFlags(),
      content: staticContent,
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { lang: [] } }, // Default English version
      { params: { lang: ['fr'] } },
      { params: { lang: ['es'] } }
    ],
    fallback: false // Set to false since we're only supporting specific languages
  }
}
