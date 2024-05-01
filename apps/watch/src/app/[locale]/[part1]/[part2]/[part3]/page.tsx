import { notFound, redirect } from 'next/navigation'
import { unstable_setRequestLocale } from 'next-intl/server'
import { ReactElement } from 'react'

import { GetVideoContainerAndVideoContent } from '../../../../../../__generated__/GetVideoContainerAndVideoContent'
import { getApolloClient } from '../../../../../libs/apolloClient/apolloClient'

import { GET_VIDEO_CONTAINER_AND_VIDEO_CONTENT } from './graphql'
import Page3PageClient from './pageClient'

interface Page3PageProps {
  params: {
    locale: string
    part1: string
    part2: string
    part3: string
  }
}

export default async function Page3Page({
  params
}: Page3PageProps): Promise<ReactElement> {
  unstable_setRequestLocale(params.locale)
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

  return <Page3PageClient content={data.content} container={data.container} />
}
