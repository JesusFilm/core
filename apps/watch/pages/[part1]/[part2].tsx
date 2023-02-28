import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'
import dynamic from 'next/dynamic'
import { SnackbarProvider } from 'notistack'
import { VideoContentFields } from '../../__generated__/VideoContentFields'
import { GetVideoContent } from '../../__generated__/GetVideoContent'
import { createApolloClient } from '../../src/libs/apolloClient'
import { LanguageProvider } from '../../src/libs/languageContext/LanguageContext'
import { VideoProvider } from '../../src/libs/videoContext'
import { VIDEO_CONTENT_FIELDS } from '../../src/libs/videoContentFields'

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
  const [contentId, contentIdExtension] = (
    context.params?.part1 as string
  ).split('.')
  const [languageId, languageIdExtension] = (
    context.params?.part2 as string
  ).split('.')

  if (contentIdExtension !== 'html' || languageIdExtension !== 'html') {
    return {
      redirect: {
        permanent: false,
        destination: `/${contentId}.html/${languageId}.html`
      }
    }
  }

  const client = createApolloClient()
  const { data } = await client.query<GetVideoContent>({
    query: GET_VIDEO_CONTENT,
    variables: {
      id: `${contentId}/${languageId}`
    }
  })
  if (data.content == null) {
    return {
      notFound: true
    }
  }
  return {
    revalidate: 3600,
    props: {
      content: data.content
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
