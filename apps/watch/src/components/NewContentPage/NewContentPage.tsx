import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { sendGTMEvent } from '@next/third-parties/google'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Bible from '@core/shared/ui/icons/Bible'
import Download2 from '@core/shared/ui/icons/Download2'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import { ThemeMode } from '@core/shared/ui/themes'

import { VideoContentFields_studyQuestions } from '../../../__generated__/VideoContentFields'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import { DownloadDialog } from '../DownloadDialog'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'

import { BibleCitations } from './BibleCitations'
import { ContentHero } from './ContentHero'
import { ContentMetadata } from './ContentMetadata'
import { ContentPageBlurFilter } from './ContentPageBlurFilter'
import { DiscussionQuestions } from './DiscussionQuestions'
import { VideoCarousel } from './VideoCarousel'

const xsmallStyles = {
  borderRadius: '64px',
  color: 'text.primary',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  bgcolor: 'white',
  '&:hover': {
    bgcolor: 'primary.main',
    color: 'common.white'
  },
  transition: 'colors 0.2s'
}

export function NewContentPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const {
    id,
    container,
    variant,
    title,
    description,
    snippet,
    images,
    imageAlt,
    label,
    studyQuestions,
    slug: videoSlug,
    bibleCitations
  } = useVideo()

  const [showShare, setShowShare] = useState(false)
  const [showDownload, setShowDownload] = useState(false)

  const variantSlug = container?.variant?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)

  const { loading, children } = useVideoChildren(variantSlug)
  const filteredChildren = children.filter((video) => video.variant !== null)

  const questions =
    studyQuestions.length > 0
      ? studyQuestions
      : ([
          {
            value: t(
              'If you could ask the creator of this video a question, what would it be?'
            )
          }
        ] as unknown as VideoContentFields_studyQuestions[])

  const handleFreeResourceClick = () => {
    sendGTMEvent({
      event: 'join_study_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId: variantSlug
    })
    window.open(
      'https://join.bsfinternational.org/?utm_source=jesusfilm-watch',
      '_blank'
    )
  }

  return (
    <>
      <NextSeo
        title={title[0].value}
        description={snippet[0].value ?? undefined}
        openGraph={{
          type: 'website',
          title: title[0].value,
          url: `${
            process.env.NEXT_PUBLIC_WATCH_URL ??
            'https://watch-jesusfilm.vercel.app'
          }${watchUrl}`,
          description: snippet[0].value ?? undefined,
          images:
            images[0]?.mobileCinematicHigh != null
              ? [
                  {
                    url: images[0].mobileCinematicHigh,
                    width: 1080,
                    height: 600,
                    alt: imageAlt[0].value,
                    type: 'image/jpeg'
                  }
                ]
              : []
        }}
        facebook={
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
            ? { appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID }
            : undefined
        }
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <PageWrapper
        hero={<ContentHero />}
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
      >
        <ContentPageBlurFilter>
          <VideoCarousel
            videos={filteredChildren}
            containerSlug={container?.slug ?? videoSlug}
            activeVideoId={id}
          />
          <Stack
            data-testid="ContentPageContent"
            gap={10}
            sx={{
              py: 10,
              zIndex: 1,
              px: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
              maxWidth: '1920px',
              width: '100%',
              mx: 'auto'
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', xl: '3fr 2fr' },
                flexWrap: 'wrap',
                zIndex: 1,
                gap: 10
              }}
            >
              <ContentMetadata
                title={title[0].value}
                description={description[0].value}
                label={label}
              />
              <DiscussionQuestions questions={questions} />
            </Box>
            <Stack
              sx={{
                zIndex: 1
              }}
              direction="row"
              spacing={2}
              justifyContent="space-between"
            >
              <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
                {t('Bible Quotes')}
              </h3>
              <Stack direction="row" spacing={2}>
                <Button
                  size="xsmall"
                  startIcon={<LinkExternal sx={{ fontSize: 16 }} />}
                  onClick={() => setShowShare(true)}
                  sx={xsmallStyles}
                >
                  {t('Share')}
                </Button>
                <Button
                  size="xsmall"
                  startIcon={<Download2 sx={{ fontSize: 16 }} />}
                  onClick={() => setShowDownload(true)}
                  sx={xsmallStyles}
                >
                  {t('Download')}
                </Button>
              </Stack>
              <DownloadDialog
                open={showDownload}
                onClose={() => setShowDownload(false)}
              />
              <ShareDialog
                open={showShare}
                onClose={() => setShowShare(false)}
              />
            </Stack>
            <BibleCitations
              bibleCitations={bibleCitations}
              freeResource={{
                heading: t('Free Resources'),
                text: t(
                  'Want to grow deep in your understanding of the Bible?'
                ),
                cta: {
                  icon: Bible,
                  label: t('Join Our Bible Study'),
                  onClick: handleFreeResourceClick
                }
              }}
            />
          </Stack>
        </ContentPageBlurFilter>
      </PageWrapper>
    </>
  )
}
