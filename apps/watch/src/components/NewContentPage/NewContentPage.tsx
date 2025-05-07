import Box from '@mui/material/Box'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import { PageWrapper } from '../PageWrapper'

import { ContentHero } from './ContentHero'
import { ContentMetadata } from './ContentMetadata'

export function NewContentPage(): ReactElement {
  const {
    container,
    variant,
    title,
    description,
    snippet,
    images,
    imageAlt,
    label
  } = useVideo()

  const slug = container?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)

  const { loading, children } = useVideoChildren(slug)
  const realChildren = children.filter((video) => video.variant !== null)

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
            <Box
              data-testid="ContentPageContent"
              sx={{
                py: 10
              }}
            >
              <ContentMetadata
                title={title[0].value}
                description={description[0].value}
                label={label}
              />
            </Box>
          </Box>
        </Box>
      </PageWrapper>
    </>
  )
}
