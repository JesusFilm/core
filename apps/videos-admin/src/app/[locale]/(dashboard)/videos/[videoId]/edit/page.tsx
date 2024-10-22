'use client'

import { Tab, Tabs, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { useAdminVideo } from '../../../../../../libs/useAdminVideo'

import { Children } from './_Children'
import { Editions } from './Editions'
import { Metadata } from './Metadata'
import { Subtitles } from './Subtitles'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { Variants } from './Variants'

export default function EditPage(): ReactElement {
  const t = useTranslations()
  const params = useParams<{ videoId: string; locale: string }>()

  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (e: SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })

  const video = data?.adminVideo

  return (
    <div>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="video edit tabs"
          >
            <Tab label={<TabLabel label="Metadata" />} />
            <Tab
              label={
                <TabLabel label="Children" count={video?.children?.length} />
              }
            />
            <Tab
              label={
                <TabLabel label="Variants" count={video?.variants?.length} />
              }
            />
            <Tab label={<TabLabel label="Editions" />} />
          </Tabs>
          <TabContainer value={tabValue} index={0}>
            <Metadata video={video} loading={loading} />
          </TabContainer>
          <TabContainer value={tabValue} index={1}>
            <Children childVideos={video?.children} />
          </TabContainer>
          <TabContainer value={tabValue} index={2}>
            <Variants variants={video?.variants} />
          </TabContainer>
          <TabContainer value={tabValue} index={3}>
            <Editions editions={[]} />
            <Subtitles subtitles={video?.subtitles} videoId={video?.id} />
          </TabContainer>
        </>
      )}
    </div>
  )
}
