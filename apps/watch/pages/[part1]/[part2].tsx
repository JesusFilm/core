import path from 'path'
import { promises as fs } from 'fs'
import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'
import dynamic from 'next/dynamic'
import { SnackbarProvider } from 'notistack'
import { GetVideoContent } from '../../__generated__/GetVideoContent'
import { Context } from '../../src/libs/videoContext/VideoContext'

import {
  GetVideoVariant,
  GetVideoVariant_variant
} from '../../__generated__/GetVideoVariant'
import { createApolloClient } from '../../src/libs/apolloClient'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../src/libs/videoContext'
import { VIDEO_CONTENT_FIELDS } from '../../src/libs/videoContentFields'
import { VIDEO_VARIANT_FIELDS } from '../../src/libs/videoVariantFields'

export const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`
export const GET_VIDEO_VARIANT = gql`
  ${VIDEO_VARIANT_FIELDS}
  query GetVideoVariant($id: ID!) {
    variant: video(id: $id) {
      ...VideoVariantFields
    }
  }
`

interface Part2PageProps {
  content: Context
}

const DynamicVideoContentPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContentPage" */
      '../../src/components/VideoContentPage'
    )
)

const DynamicVideoContainerPage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoContainerPage" */
      '../../src/components/VideoContainerPage'
    )
)

export default function Part2Page({ content }: Part2PageProps): ReactElement {
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

export const getStaticProps: GetStaticProps<Part2PageProps> = async (
  context
) => {
  const client = createApolloClient()
  const { data } = await client.query<GetVideoContent>({
    query: GET_VIDEO_CONTENT,
    variables: {
      id: `${(context.params?.part1 as string).split('.')[0]}/${
        (context.params?.part2 as string).split('.')[0]
      }`
    }
  })
  if (data.content == null) {
    return {
      notFound: true
    }
  }

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

  const variantCache = await cache.get()

  let cachedVariant = variantCache.find(
    (variant) => variant.id === data.content?.id
  )

  if (cachedVariant === undefined) {
    const {
      data: { variant }
    } = await client.query<GetVideoVariant>({
      query: GET_VIDEO_VARIANT,
      variables: {
        id: data.content?.id
      }
    })
    if (variant !== null) {
      cachedVariant = variant
      void cache.set([...variantCache, variant])
    }
  }

  return {
    revalidate: 3600,
    props: {
      content: { ...data.content, ...cachedVariant }
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { part1: 'jesus', part2: 'english' } },
      { params: { part1: 'life-of-jesus-gospel-of-john', part2: 'english' } },
      { params: { part1: 'jesus-calms-the-storm', part2: 'english' } },
      { params: { part1: 'magdalena', part2: 'english' } },
      { params: { part1: 'reflections-of-hope', part2: 'english' } },
      { params: { part1: 'day-6-jesus-died-for-me', part2: 'english' } },
      { params: { part1: 'book-of-acts', part2: 'english' } },
      { params: { part1: 'wedding-in-cana', part2: 'english' } },
      { params: { part1: 'lumo', part2: 'english' } },
      {
        params: {
          part1: 'peter-miraculous-escape-from-prison',
          part2: 'english'
        }
      },
      { params: { part1: '8-days-with-jesus-who-is-jesus', part2: 'english' } },
      { params: { part1: 'chosen-witness', part2: 'english' } },
      { params: { part1: 'lumo-the-gospel-of-luke', part2: 'english' } },
      { params: { part1: 'storyclubs-jesus-and-zacchaeus', part2: 'english' } },
      { params: { part1: 'birth-of-jesus', part2: 'english' } },
      { params: { part1: 'fallingplates', part2: 'english' } },
      { params: { part1: 'paul-and-silas-in-prison', part2: 'english' } },
      { params: { part1: 'my-last-day', part2: 'english' } },
      { params: { part1: 'the-beginning', part2: 'english' } }
    ],
    fallback: 'blocking'
  }
}
