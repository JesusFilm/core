import { gql } from '@apollo/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'
import { VideoContentFields } from '../../__generated__/VideoContentFields'
import { GetVideoContent } from '../../__generated__/GetVideoContent'
import { createApolloClient } from '../../src/libs/client'
import { VideoContainer } from '../../src/components/VideoContainer'
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

export default function Part2Page({ content }: Part2PageProps): ReactElement {
  return <VideoContainer content={content} />
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
  return {
    props: {
      content: data.content
    }
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}
