import { gql } from '@apollo/client'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { GetVideoContainerAndVideoContent } from '../../../../../../__generated__/GetVideoContainerAndVideoContent'
import { getApolloClient } from '../../../../../libs/apolloClient/apolloClient'
import { VIDEO_CONTENT_FIELDS } from '../../../../../libs/videoContentFields'

import Page3PageClient from './pageClient'

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

interface Page3PageProps {
  params: {
    languageId: string
    part1: string
    part2: string
    part3: string
  }
}

export default async function Page3Page({
  params
}: Page3PageProps): Promise<ReactElement> {
  const [containerId, containerIdExtension] = params.part1.split('.')
  const [contentId, contentIdExtension] = params.part2.split('.')
  const [languageId, languageIdExtension] = params.part3.split('.')

  if (
    containerIdExtension !== 'html' ||
    contentIdExtension !== undefined ||
    languageIdExtension !== 'html'
  ) {
    return redirect(`/${containerId}.html/${contentId}/${languageId}.html`)
  }

  const { data } =
    await getApolloClient().query<GetVideoContainerAndVideoContent>({
      query: GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT,
      variables: {
        containerId: `${containerId}/${languageId}`,
        contentId: `${contentId}/${languageId}`
      }
    })
  if (data.container == null || data.content == null) {
    return notFound()
  }

  return (
    <Page3PageClient
      languageId={languageId}
      content={data.content}
      container={data.container}
    />
  )
}
