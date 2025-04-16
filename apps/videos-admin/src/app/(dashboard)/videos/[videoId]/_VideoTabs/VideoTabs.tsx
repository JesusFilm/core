'use client'

import { useQuery } from '@apollo/client'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { graphql } from 'gql.tada'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ReactElement, useEffect, useState } from 'react'

import { getVideoChildrenLabel } from '../../../../../libs/getVideoChildrenLabel'

import { TabLabel } from './_TabLabel'

const GET_TAB_DATA = graphql(`
  query GetTabData($id: ID!) {
    adminVideo(id: $id) {
      id
      label
      variantLanguagesCount
      videoEditions {
        id
      }
      childrenCount
    }
  }
`)

type VideoTabViewProps = {
  currentTab: string
  videoId: string
}

export function VideoTabView({
  currentTab,
  videoId
}: VideoTabViewProps): ReactElement {
  const params = useSearchParams()
  const [reloadOnParamChange, setReloadOnParamChange] = useState(false)
  const { data, refetch } = useQuery(GET_TAB_DATA, {
    variables: {
      id: videoId
    }
  })

  const showVideoChildren: boolean =
    data?.adminVideo.label === 'collection' ||
    data?.adminVideo.label === 'featureFilm' ||
    data?.adminVideo.label === 'series'

  const videoLabel = getVideoChildrenLabel(data?.adminVideo.label)

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
      count: data?.adminVideo.variantLanguagesCount,
      href: `/videos/${videoId}/audio`
    },
    {
      label: 'Editions',
      value: 'editions',
      count: data?.adminVideo.videoEditions.length,
      href: `/videos/${videoId}/editions`
    }
  ]
  if (showVideoChildren && videoLabel != null) {
    tabs.splice(1, 0, {
      label: 'Children',
      value: 'children',
      count: data?.adminVideo.childrenCount,
      href: `/videos/${videoId}/children`
    })
  }
  useEffect(() => {
    if (reloadOnParamChange) void refetch()
    setReloadOnParamChange(params?.get('update') === 'information')
  }, [params])
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
