import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import { CollectionsPageContent } from '../CollectionsPage/CollectionsPageContent'
import { PageWrapper } from '../PageWrapper'

import { ContentHero } from './ContentHero'

export function NewContentPage(): ReactElement {
  const { container, variant, title, snippet, images, imageAlt, label } =
    useVideo()

  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)

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
        <CollectionsPageContent />
      </PageWrapper>
    </>
  )
}
