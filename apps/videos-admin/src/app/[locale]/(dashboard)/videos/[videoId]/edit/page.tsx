'use client'

import { Box, Button, Divider, Tab, Tabs, Typography , styled } from '@mui/material'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { Drawer } from '../../../../../../components/Drawer'
import { useAdminVideo } from '../../../../../../libs/useAdminVideo'

import { Children } from './Children'
import { Editions } from './Editions'
import { Metadata } from './Metadata'
import { Section } from './Section'
import { Subtitles } from './Subtitles'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { Variants } from './Variants'
import { createFilledContext } from '../../../../../../libs/createFilledContext'

const DRAWER_WIDTH = 500

export enum ActiveDrawerContent {
  StudyQuestion = 0
}

interface EditorContext {
  activeDrawerContent: ActiveDrawerContent
  showDrawer: boolean
}

const EditorContext = createFilledContext<EditorContext>({
  activeDrawerContent: ActiveDrawerContent.StudyQuestion,
  showDrawer: false
})

const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'open'
})<{ open?: boolean }>(({ theme }) => ({
  maxWidth: 1024,
  width: '100%',
  flexGrow: 1,
  marginRight: -DRAWER_WIDTH,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }),
        marginRight: 0
      }
    }
  ]
}))

export default function EditPage(): ReactElement {
  const t = useTranslations()
  const params = useParams<{ videoId: string; locale: string }>()
  const [open, setOpen] = useState(false)

  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (e: SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })

  const video = data?.adminVideo

  return (
    <div style={{ width: '100%' }}>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Container>
            <Typography variant="h4">{t('Edit Video')}</Typography>
            <Button onClick={() => setOpen((prev) => !prev)}>
              Open Drawer
            </Button>
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
          </Container>
          <Divider sx={{ mb: 4 }} />
          <Container sx={{ position: 'relative' }} open={open}>
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
          </Container>
          <Drawer
            title={t('Editor')}
            open={open}
            onClose={() => setOpen(false)}
          >
            <Section title={t('Section')}>
              <h1>This is drawer content</h1>
            </Section>
          </Drawer>
        </>
      )}
    </div>
  )
}
