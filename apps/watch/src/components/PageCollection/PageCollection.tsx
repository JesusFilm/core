import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useState } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import { ThemeMode } from '@core/shared/ui/themes'

import { useVideo } from '../../libs/videoContext'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { DialogShare } from '../DialogShare'
import { PageWrapper } from '../PageWrapper'
import { SectionVideoGrid } from '../SectionVideoGrid'
import { ContentMetadata } from '../PageSingleVideo/ContentMetadata'

import { CollectionHero } from './CollectionHero'
import { CollectionLanguageSelect } from './CollectionLanguageSelect'

export function PageCollection(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { id, title, description, snippet, images, imageAlt, label, variant } =
    useVideo()
  const [showShare, setShowShare] = useState(false)

  const seoTitle = last(title)?.value
  const seoDescription = last(snippet)?.value ?? undefined
  const seoImage = last(images)?.mobileCinematicHigh
  const seoAlt = last(imageAlt)?.value ?? seoTitle ?? ''
  const resolvedDescription =
    last(description)?.value ?? seoDescription ?? ''

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        openGraph={{
          type: 'website',
          title: seoTitle,
          description: seoDescription,
          images:
            seoImage != null
              ? [
                  {
                    url: seoImage,
                    width: 1080,
                    height: 600,
                    alt: seoAlt,
                    type: 'image/jpeg'
                  }
                ]
              : []
        }}
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <PageWrapper
        hero={<CollectionHero />}
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
      >
        <ContentPageBlurFilter>
          <>
            <div className="flex flex-col gap-12 py-14 z-10 responsive-container">
              <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-10 items-start">
                <ContentMetadata
                  title={seoTitle ?? ''}
                  description={resolvedDescription}
                  label={label}
                  showDownloadButton={false}
                />
                <div className="flex flex-col gap-6">
                  <CollectionLanguageSelect />
                  <div className="flex flex-row justify-end">
                    <button
                      onClick={() => setShowShare(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 font-bold uppercase tracking-wider bg-white hover:bg-[#cb333b] hover:text-white transition-colors duration-200 text-sm cursor-pointer"
                    >
                      <LinkExternal className="w-4 h-4" />
                      {t('Share')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <SectionVideoGrid
                primaryCollectionId={id}
                languageId={variant?.language.id}
                showSequenceNumbers
                analyticsTag="collection-detail-grid"
              />
            </div>
          </>
        </ContentPageBlurFilter>
      </PageWrapper>
      <DialogShare open={showShare} onClose={() => setShowShare(false)} />
    </>
  )
}
