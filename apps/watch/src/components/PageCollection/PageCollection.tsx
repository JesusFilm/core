import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import {
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useLanguages } from '../../libs/useLanguages'
import { useVideo } from '../../libs/videoContext'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { DialogShare } from '../DialogShare'
import {
  LanguageFilterDropdown,
  type LanguageFilterOption
} from '../LanguageFilterDropdown'
import { PageWrapper } from '../PageWrapper'
import { SectionVideoGrid } from '../SectionVideoGrid'

import { CollectionHero } from './CollectionHero'
import { CollectionMetadata } from './CollectionMetadata'

function normalizeParam(param?: string | string[]): string | undefined {
  if (param == null) return undefined
  return Array.isArray(param) ? param[0] : param
}

export function PageCollection(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  const [showShare, setShowShare] = useState(false)
  const {
    id,
    title,
    description,
    snippet,
    images,
    imageAlt,
    label,
    childrenCount
  } = useVideo()
  const { languages, isLoading: languagesLoading } = useLanguages()

  const collectionSegment = normalizeParam(router.query.part1)
  const rawLanguageParam = normalizeParam(router.query.part2)
  const selectedLanguageSlug =
    rawLanguageParam?.replace('.html', '') ?? 'english'

  const languageOptions = useMemo<LanguageFilterOption[]>(() => {
    return languages.map((language) => ({
      value: language.slug,
      englishName: language.englishName?.value ?? language.displayName,
      nativeName: language.nativeName?.value ?? language.displayName
    }))
  }, [languages])

  const selectedLanguage = useMemo(
    () => languages.find((lang) => lang.slug === selectedLanguageSlug),
    [languages, selectedLanguageSlug]
  )

  const handleLanguageSelect = useCallback(
    (slug: string) => {
      if (collectionSegment == null) return
      const normalizedSlug = slug.replace('.html', '')
      const path = `/watch/${collectionSegment}/${encodeURIComponent(
        normalizedSlug
      )}.html`
      void router.push(path, undefined, { locale: router.locale })
    },
    [collectionSegment, router]
  )

  const languageSegment =
    rawLanguageParam ?? `${selectedLanguageSlug}.html`
  const watchUrlBase =
    process.env.NEXT_PUBLIC_WATCH_URL ?? 'https://watch-jesusfilm.vercel.app'
  const canonicalSegments = ['watch']
  if (collectionSegment != null) canonicalSegments.push(collectionSegment)
  if (languageSegment != null) canonicalSegments.push(languageSegment)
  const canonicalPath = canonicalSegments.join('/')
  const canonicalUrl = `${watchUrlBase}/${canonicalPath}`

  const titleText = last(title)?.value ?? ''
  const descriptionText = last(description)?.value ?? ''
  const snippetText = last(snippet)?.value ?? ''
  const heroImage = last(images)?.mobileCinematicHigh
  const heroAlt = last(imageAlt)?.value ?? titleText

  return (
    <>
      <NextSeo
        title={titleText}
        description={snippetText || descriptionText || undefined}
        openGraph={{
          type: 'website',
          title: titleText,
          url: canonicalUrl,
          description: snippetText || descriptionText || undefined,
          images:
            heroImage != null
              ? [
                  {
                    url: heroImage,
                    width: 1080,
                    height: 600,
                    alt: heroAlt,
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
        hero={<CollectionHero languageSlug={selectedLanguageSlug} />}
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
      >
        <ContentPageBlurFilter>
          <div className="flex flex-col gap-20 py-14 z-10 responsive-container">
            <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] z-10 gap-20">
              <CollectionMetadata
                title={titleText}
                description={descriptionText}
                snippet={snippetText}
                label={label}
                childCount={childrenCount}
                onShare={() => setShowShare(true)}
              />
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-wider uppercase text-red-100/70">
                  {t('Languages')}
                </p>
                <LanguageFilterDropdown
                  options={languageOptions}
                  loading={languagesLoading}
                  selectedValue={selectedLanguageSlug}
                  placeholder={t('Search languages...')}
                  emptyLabel={t('No languages found.')}
                  loadingLabel={t('Loading languages...')}
                  onSelect={handleLanguageSelect}
                />
              </div>
            </div>
            <SectionVideoGrid
              id="collection-video-grid"
              primaryCollectionId={id}
              languageId={selectedLanguage?.id}
            />
          </div>
          <DialogShare open={showShare} onClose={() => setShowShare(false)} />
        </ContentPageBlurFilter>
      </PageWrapper>
    </>
  )
}
