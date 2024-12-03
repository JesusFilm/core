'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { PublishedChip } from '../../../../../../components/PublishedChip'
import { useAdminVideo } from '../../../../../../libs/useAdminVideo'

import { Children } from './Children'
import { Editions } from './Editions'
import { Metadata } from './Metadata'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { Variants } from './Variants'

export function VideoView(): ReactElement {
  const t = useTranslations()
  const params = useParams<{ videoId: string; locale: string }>()
  const [tabValue, setTabValue] = useState(0)
  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })
  const video = data?.adminVideo

  function handleTabChange(_e: SyntheticEvent, newValue: number): void {
    setTabValue(newValue)
  }

  return (
    <Stack
      gap={2}
      sx={{ width: '100%', maxWidth: 1700 }}
      data-testid="VideoView"
    >
      <Stack
        gap={2}
        direction="row"
        flexWrap="wrap"
        sx={{ mb: 2, alignItems: 'center' }}
      >
        <Typography variant="h4">{t('Editing')} :</Typography>
        <Typography variant="h4">{data?.adminVideo.title[0].value}</Typography>
        <PublishedChip published={data?.adminVideo.published ?? false} />
      </Stack>
      <Stack gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box width="100%">
          {loading ? (
            <Typography>{t('Loading...')}</Typography>
          ) : (
            <>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="video-edit-tabs"
              >
                <Tab label={<TabLabel label="Metadata" />} />
                <Tab
                  label={
                    <TabLabel
                      label="Children"
                      count={video?.children?.length}
                    />
                  }
                />
                <Tab
                  label={
                    <TabLabel
                      label="Variants"
                      count={video?.variants?.length}
                    />
                  }
                />
                <Tab label={<TabLabel label="Editions" />} />
              </Tabs>
              <Divider sx={{ mb: 4 }} />
              <TabContainer value={tabValue} index={0}>
                {video != null && <Metadata video={video} loading={loading} />}
              </TabContainer>
              <TabContainer value={tabValue} index={1}>
                <Children childVideos={video?.children ?? []} />
              </TabContainer>
              <TabContainer value={tabValue} index={2}>
                <Variants variants={video?.variants} />
              </TabContainer>
              <TabContainer value={tabValue} index={3}>
                <Editions editions={[]} />
              </TabContainer>
            </>
          )}
        </Box>
      </Stack>
    </Stack>
  )
}
