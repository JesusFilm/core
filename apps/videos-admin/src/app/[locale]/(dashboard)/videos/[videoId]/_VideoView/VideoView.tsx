'use client'

import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useMemo, useState } from 'react'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'

import { PublishedChip } from '../../../../../../components/PublishedChip'
import { buildLanguageHashMap } from '../../../../../../libs/languageMapping'
import { useAdminVideo } from '../../../../../../libs/useAdminVideo'
import { GET_HEYGEN_LANGUAGES } from '../../_VideoList/VideoList'

import { Metadata } from './Metadata'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { Variants } from './Variants'
import { VideoChildren } from './VideoChildren'
import { getVideoChildrenLabel } from './VideoChildren/getVideoChildrenLabel'

export function VideoView(): ReactElement {
  const t = useTranslations()
  const params = useParams<{ videoId: string; locale: string }>()
  const [tabValue, setTabValue] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')

  // Get the current video data
  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })

  // Get all available languages
  const { data: languagesData } = useLanguagesQuery({ languageId: '529' })

  console.log('languagesData', languagesData)
  // Get Heygen supported languages
  const { data: heygenData } = useQuery(GET_HEYGEN_LANGUAGES)

  const video = data?.adminVideo
  const videoTitle = data?.adminVideo.title[0].value

  // Calculate missing languages
  const missingLanguages = useMemo(() => {
    const heygenLanguages = heygenData?.heygenLanguages
    if (!heygenLanguages || !languagesData?.languages || !video?.variants) {
      return []
    }

    // Get current variant language IDs
    const currentLanguageIds = new Set(
      video.variants.map((variant) => variant.language.id)
    )

    // Build language hash map
    const languageMap = buildLanguageHashMap(languagesData.languages)

    // Filter languages that are both supported by Heygen and not yet having a variant
    return heygenLanguages
      .filter(
        (heygenLang) =>
          languageMap[heygenLang] != null &&
          !currentLanguageIds.has(languageMap[heygenLang].id)
      )
      .map((heygenLang) => {
        const mapping = languageMap[heygenLang]
        return languagesData.languages.find((lang) => lang.id === mapping.id)!
      })
  }, [heygenData?.heygenLanguages, languagesData?.languages, video?.variants])

  function handleTabChange(_e: SyntheticEvent, newValue: number): void {
    setTabValue(newValue)
  }

  function handleLanguageChange(event: { target: { value: string } }): void {
    setSelectedLanguage(event.target.value)
  }

  async function handleCreateVariant(): Promise<void> {
    // TODO: Implement the mutation to create a new variant using Heygen
    console.log('Creating variant for language:', selectedLanguage)
  }

  const showVideoChildren: boolean =
    video?.label === 'collection' ||
    video?.label === 'featureFilm' ||
    video?.label === 'series'

  const videoLabel = getVideoChildrenLabel(video?.label)

  // console.log('video?.variants', video?.variants)
  console.log('missingLanguages', missingLanguages)

  return (
    <Stack
      gap={2}
      sx={{ width: '100%', maxWidth: 1700 }}
      data-testid="VideoView"
    >
      {data != null && (
        <Stack
          gap={2}
          sx={{
            mb: 2,
            alignItems: { xs: 'start', sm: 'center' },
            flexDirection: { xs: 'col', sm: 'row' }
          }}
        >
          <Typography variant="h4">{videoTitle}</Typography>
          <PublishedChip published={data.adminVideo.published} />
        </Stack>
      )}
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
                <Tab value={0} label={<TabLabel label="Metadata" />} />
                {showVideoChildren && videoLabel != null && (
                  <Tab
                    value={1}
                    label={
                      <TabLabel
                        label={videoLabel}
                        count={video?.children?.length}
                      />
                    }
                  />
                )}
                <Tab
                  value={2}
                  label={
                    <TabLabel
                      label={t('Audio Languages')}
                      count={video?.variants?.length}
                    />
                  }
                />
              </Tabs>
              <Divider sx={{ mb: 4 }} />
              <TabContainer value={tabValue} index={0}>
                {video != null && (
                  <Metadata
                    video={video}
                    loading={loading}
                    missingLanguages={missingLanguages}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={handleLanguageChange}
                    onCreateVariant={handleCreateVariant}
                  />
                )}
              </TabContainer>
              <TabContainer value={tabValue} index={1}>
                {showVideoChildren && videoLabel != null && (
                  <VideoChildren
                    videoId={video?.id ?? ''}
                    childVideos={video?.children ?? []}
                    label={videoLabel}
                  />
                )}
              </TabContainer>
              <TabContainer value={tabValue} index={2}>
                <Variants variants={video?.variants} />
              </TabContainer>
            </>
          )}
        </Box>
      </Stack>
    </Stack>
  )
}
