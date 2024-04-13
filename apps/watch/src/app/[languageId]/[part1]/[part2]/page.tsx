import { gql } from '@apollo/client'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { GetVideoContent } from '../../../../../__generated__/GetVideoContent'
import { getApolloClient } from '../../../../libs/apolloClient/apolloClient'
import { VIDEO_CONTENT_FIELDS } from '../../../../libs/videoContentFields'

import Page2PageClient from './pageClient'

export const GET_VIDEO_CONTENT = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetVideoContent($id: ID!, $languageId: ID) {
    content: video(id: $id, idType: slug) {
      ...VideoContentFields
    }
  }
`

interface Page2PageProps {
  params: {
    languageId: string
    part1: string
    part2: string
  }
}

export default async function Page2Page({
  params
}: Page2PageProps): Promise<ReactElement> {
  const [contentId, contentIdExtension] = params.part1.split('.')
  const [languageId, languageIdExtension] = params.part2.split('.')

  if (contentIdExtension !== 'html' || languageIdExtension !== 'html') {
    return redirect(`/${contentId}.html/${languageId}.html`)
  }

  const { data } = await getApolloClient().query<GetVideoContent>({
    query: GET_VIDEO_CONTENT,
    variables: {
      id: `${contentId}/${languageId}`
    }
  })
  if (data.content == null) {
    return notFound()
  }
  return (
    <Page2PageClient languageId={params.languageId} content={data.content} />
  )
}
