'use client'

import { useSuspenseQuery } from '@apollo/client'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { graphql } from 'gql.tada'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { ReactElement } from 'react'

import { getVideoChildrenLabel } from '../../../../../libs/getVideoChildrenLabel'

import { TabLabel } from './_label'

const GET_TAB_DATA = graphql(`
  query GetTabData($id: ID!) {
    adminVideo(id: $id) {
      label
      variantLanguagesCount
      editionsCount
      childrenCount
    }
  }
`)

type VideoTabViewProps = {
  params: {
    videoId: string
  }
}

export default function VideoTabView({
  params: { videoId }
}: VideoTabViewProps): ReactElement {
  // get the current tab from the url in an RSC
  const currentTab = useSelectedLayoutSegment() || 'metadata'

  const { data } = useSuspenseQuery(GET_TAB_DATA, {
    variables: {
      id: videoId
    }
  })

  const showVideoChildren: boolean =
    data.adminVideo.label === 'collection' ||
    data.adminVideo.label === 'featureFilm' ||
    data.adminVideo.label === 'series'

  const videoLabel = getVideoChildrenLabel(data.adminVideo.label)

  const tabs = [
    {
      label: 'Metadata',
      value: 'metadata',
      count: null,
      href: `/videos/${videoId}`
    },
    {
      label: 'Audio Languages',
      value: 'audio',
      count: data.adminVideo.variantLanguagesCount,
      href: `/videos/${videoId}/audio`
    },
    {
      label: 'Editions',
      value: 'editions',
      count: data.adminVideo.editionsCount,
      href: `/videos/${videoId}/editions`
    }
  ]
  if (showVideoChildren && videoLabel != null) {
    tabs.splice(1, 0, {
      label: 'Children',
      value: 'children',
      count: data.adminVideo.childrenCount,
      href: `/videos/${videoId}/children`
    })
  }

  return (
    <Tabs value={currentTab} aria-label="video-edit-tabs">
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={<TabLabel label={tab.label} count={tab.count ?? undefined} />}
          component={Link}
          href={tab.href}
        />
      ))}
    </Tabs>
  )
}
