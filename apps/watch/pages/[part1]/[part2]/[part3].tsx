import { promises as fs } from 'fs'
import path from 'path'
import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'
import { SnackbarProvider } from 'notistack'
import {
  GetVideoVariant,
  GetVideoVariant_variant
} from '../../../__generated__/GetVideoVariant'
import { VideoContentPage } from '../../../src/components/VideoContentPage'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { GetVideoContainerAndVideoContent } from '../../../__generated__/GetVideoContainerAndVideoContent'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../../src/libs/videoContext'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'
import { GET_VIDEO_VARIANT } from '../[part2]'
import { VideoFields } from '../../../src/libs/videoContext/VideoContext'

export const GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContainerAndVideoContent(
    $containerId: ID!
    $contentId: ID!
    $languageId: ID
  ) {
    container: video(id: $containerId, idType: slug) {
      ...VideoContentFields
    }
    content: video(id: $contentId, idType: slug) {
      ...VideoContentFields
    }
  }
`

interface Part3PageProps {
  container: VideoFields
  content: VideoFields
}

export default function Part3Page({
  container,
  content
}: Part3PageProps): ReactElement {
  return (
    <SnackbarProvider>
      <LanguageProvider>
        <VideoProvider value={{ content, container }}>
          <VideoContentPage />
        </VideoProvider>
      </LanguageProvider>
    </SnackbarProvider>
  )
}

export const getStaticProps: GetStaticProps<Part3PageProps> = async (
  context
) => {
  const client = createApolloClient()
  const { data } = await client.query<GetVideoContainerAndVideoContent>({
    query: GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT,
    variables: {
      containerId: `${(context.params?.part1 as string).split('.')[0]}/${
        (context.params?.part3 as string).split('.')[0]
      }`,
      contentId: `${(context.params?.part2 as string).split('.')[0]}/${
        (context.params?.part3 as string).split('.')[0]
      }`
    }
  })
  if (data.container == null || data.content == null) {
    return {
      notFound: true
    }
  }

  // set/get functions to get variant slugs from cache.
  // Must be defined in getStaticProps for fs to work.
  async function upsertFile(name: string): Promise<Buffer> {
    try {
      return await fs.readFile(name)
    } catch (error) {
      await fs.writeFile(name, '[]')
      return await fs.readFile(name)
    }
  }

  const cache = {
    get: async (): Promise<GetVideoVariant_variant[]> => {
      const data = await upsertFile(path.join(process.cwd(), 'variants.db'))
      const variants: GetVideoVariant_variant[] = JSON.parse(
        data as unknown as string
      )
      return variants
    },
    set: async (variants: GetVideoVariant_variant[]) => {
      return await fs.writeFile(
        path.join(process.cwd(), 'variants.db'),
        JSON.stringify(variants)
      )
    }
  }

  async function attemptToGetVariantSetCache(
    maybeVariant: GetVideoVariant_variant | undefined,
    id: string
  ): Promise<GetVideoVariant_variant | undefined> {
    if (maybeVariant === undefined) {
      const {
        data: { variant }
      } = await client.query<GetVideoVariant>({
        query: GET_VIDEO_VARIANT,
        variables: {
          id: id
        }
      })
      if (variant !== null) {
        maybeVariant = variant
        void cache.set([...variantCache, variant])
      }
    }
    return maybeVariant
  }
  // end set/get functions to get variant slugs from cache.

  // attempt getting variants
  const variantCache = await cache.get()

  let contentVariant = variantCache.find(
    (variant) => variant.id === data.content?.id
  )

  contentVariant = await attemptToGetVariantSetCache(
    contentVariant,
    data.content?.id
  )

  let containerVariant = variantCache.find(
    (variant) => variant.id === data.container?.id
  )

  containerVariant = await attemptToGetVariantSetCache(
    containerVariant,
    data.container?.id
  )
  // end attempt getting variants

  return {
    revalidate: 3600,
    props: {
      container: {
        ...data.container,
        variantLanguagesWithSlug:
          containerVariant != null
            ? containerVariant.variantLanguagesWithSlug
            : []
      },
      content: {
        ...data.content,
        variantLanguagesWithSlug:
          contentVariant != null ? contentVariant.variantLanguagesWithSlug : []
      }
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}
