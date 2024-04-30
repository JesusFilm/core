import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { GetVideoContent } from '../../../../../__generated__/GetVideoContent'
import { getApolloClient } from '../../../../libs/apolloClient/apolloClient'
import { languages } from '../../../../libs/il8n/settings'

import { GET_VIDEO_CONTENT } from './graphql'
import Page2PageClient from './pageClient'

interface Page2PageParams {
  languageId: string
  part1: string
  part2: string
}
interface Page2PageProps {
  params: Page2PageParams
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

export function generateStaticParams(): Page2PageParams[] {
  return languages
    .map((languageId) => [
      { part1: 'jesus.html', part2: 'english.html', languageId },
      {
        part1: 'life-of-jesus-gospel-of-john.html',
        part2: 'english.html',
        languageId
      },
      {
        part1: 'jesus-calms-the-storm.html',
        part2: 'english.html',
        languageId
      },
      { part1: 'magdalena.html', part2: 'english.html', languageId },
      { part1: 'reflections-of-hope.html', part2: 'english.html', languageId },
      {
        part1: 'day-6-jesus-died-for-me.html',
        part2: 'english.html',
        languageId
      },
      { part1: 'book-of-acts.html', part2: 'english.html', languageId },
      { part1: 'wedding-in-cana.html', part2: 'english.html', languageId },
      { part1: 'lumo.html', part2: 'english.html', languageId },
      {
        part1: 'peter-miraculous-escape-from-prison.html',
        part2: 'english.html',
        languageId
      },
      {
        part1: '8-days-with-jesus-who-is-jesus.html',
        part2: 'english.html',
        languageId
      },
      { part1: 'chosen-witness.html', part2: 'english.html', languageId },
      {
        part1: 'lumo-the-gospel-of-luke.html',
        part2: 'english.html',
        languageId
      },
      {
        part1: 'storyclubs-jesus-and-zacchaeus.html',
        part2: 'english.html',
        languageId
      },
      { part1: 'birth-of-jesus.html', part2: 'english.html', languageId },
      { part1: 'fallingplates.html', part2: 'english.html', languageId },
      {
        part1: 'paul-and-silas-in-prison.html',
        part2: 'english.html',
        languageId
      },
      { part1: 'my-last-day.html', part2: 'english.html', languageId },
      { part1: 'the-beginning.html', part2: 'english.html', languageId }
    ])
    .flat()
}
