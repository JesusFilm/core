import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { VideoContentPage } from '../../../src/components/VideoContentPage'
import { createApolloClient } from '../../../src/libs/client'
import { GetVideoContainerAndVideoContent } from '../../../__generated__/GetVideoContainerAndVideoContent'
import { LanguageProvider } from '../../../src/libs/languageContext/LanguageContext'
import { VIDEO_CONTENT_FIELDS } from '../../../src/libs/videoContentFields'

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
  container: VideoContentFields
  content: VideoContentFields
}

export default function Part2Page({
  container,
  content
}: Part3PageProps): ReactElement {
  return (
    <LanguageProvider>
      <VideoContentPage container={container} content={content} />
    </LanguageProvider>
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
  return {
    props: {
      container: data.container,
      content: data.content
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}
