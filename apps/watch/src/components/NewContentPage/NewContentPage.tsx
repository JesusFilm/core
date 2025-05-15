import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'

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

import { ContentHero } from './ContentHero'
import { ContentMetadata } from './ContentMetadata'
import { DiscussionQuestions } from './DiscussionQuestions'
import { VideoCarousel } from './VideoCarousel'

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
    slug: videoSlug
  } = useVideo()

  const [showShare, setShowShare] = useState(false)
  const [showDownload, setShowDownload] = useState(false)

  const variantSlug = container?.variant?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)

  const { loading, children } = useVideoChildren(variantSlug)
  const realChildren = children.filter((video) => video.variant !== null)

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
        <Box
          data-testid="ContentPage"
          sx={{
            bgcolor: 'common.black',
            color: 'common.white',
            position: 'relative',
            minHeight: '100svh'
          }}
        >
          <Box
            data-testid="ContentPageBlurFilter"
            sx={{
              maxWidth: '1920px',
              zIndex: 1,
              mx: 'auto',
              position: 'sticky',
              height: '100vh',
              top: 0,
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'brightness(.6) blur(40px)'
            }}
          />
          <Box
            data-testid="ContentPageContainer"
            sx={{
              width: '100%',
              mt: '-100vh'
            }}
          >
            <Stack
              data-testid="ContentPageContent"
              gap={10}
              sx={{
                py: 10
              }}
            >
              <VideoCarousel
                videos={realChildren}
                containerSlug={container?.slug ?? videoSlug}
                activeVideoId={id}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', xl: '3fr 2fr' },
                  flexWrap: 'wrap',
                  zIndex: 1,
                  gap: 10,
                  px: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 }
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
                  zIndex: 1,
                  px: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 }
                }}
                direction="row"
                spacing={2}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2}>
                  <Button
                    size="xsmall"
                    startIcon={<LinkExternal sx={{ fontSize: 16 }} />}
                    onClick={() => setShowShare(true)}
                    sx={{
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
                    }}
                  >
                    {t('Share')}
                  </Button>
                  <Button
                    size="xsmall"
                    startIcon={<Download2 sx={{ fontSize: 16 }} />}
                    onClick={() => setShowDownload(true)}
                    sx={{
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
                    }}
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
            </Stack>
          </Box>
        </Box>
      </PageWrapper>
    </>
  )
}
