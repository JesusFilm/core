import last from 'lodash/last'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { ReactElement, useCallback, useMemo, useState } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useLanguages } from '../../libs/useLanguages'
import { useVariantLanguagesIdAndSlugQuery } from '../../libs/useVariantLanguagesIdAndSlugQuery'
import { useVideo } from '../../libs/videoContext'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { DialogShare } from '../DialogShare'
import { type LanguageFilterOption } from '../LanguageFilterDropdown'
import { PageWrapper } from '../PageWrapper'
import { SectionVideoGrid } from '../SectionVideoGrid'

import { CollectionHero } from './CollectionHero'
import { CollectionMetadata } from './CollectionMetadata'

function normalizeParam(param?: string | string[]): string | undefined {
  if (param == null) return undefined
  return Array.isArray(param) ? param[0] : param
}

export function PageCollection(): ReactElement {
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
  const { languages: allLanguages } = useLanguages()
  const { data: variantLanguagesData, loading: collectionLanguagesLoading } =
    useVariantLanguagesIdAndSlugQuery({
      variables: { id: id },
      skip: id == null
    })

  const collectionSegment = normalizeParam(router.query.part1)
  const rawLanguageParam = normalizeParam(router.query.part2)
  const selectedLanguageSlug =
    rawLanguageParam?.replace('.html', '') ?? 'english'

  const languageOptions = useMemo<LanguageFilterOption[]>(() => {
    // Get available language slugs from collection variant languages
    const availableLanguageSlugs =
      variantLanguagesData?.video?.variantLanguages?.map(
        (variantLang) => variantLang.slug
      ) ?? []

    // Filter languages to only include those available for this collection
    const filteredLanguages = allLanguages.filter((language) =>
      availableLanguageSlugs.includes(language.slug)
    )

    return filteredLanguages.map((language) => ({
      value: language.slug,
      englishName: language.englishName?.value ?? language.displayName,
      nativeName: language.nativeName?.value ?? language.displayName
    }))
  }, [allLanguages, variantLanguagesData])

  const selectedLanguage = useMemo(
    () => allLanguages.find((lang) => lang.slug === selectedLanguageSlug),
    [allLanguages, selectedLanguageSlug]
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

  const languageSegment = rawLanguageParam ?? `${selectedLanguageSlug}.html`
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
        hero={
          <CollectionHero
            languageSlug={selectedLanguageSlug}
            onShare={() => setShowShare(true)}
          />
        }
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
      >
        <ContentPageBlurFilter>
          <div className="z-10 flex flex-col gap-0 py-14">
            <div className="z-10 flex flex-col gap-6">
              <CollectionMetadata
                title={titleText}
                description={descriptionText}
                snippet={snippetText}
                label={label}
                childCount={childrenCount}
                languageOptions={languageOptions}
                languagesLoading={collectionLanguagesLoading}
                selectedLanguageSlug={selectedLanguageSlug}
                onLanguageSelect={handleLanguageSelect}
              />
            </div>
            <SectionVideoGrid
              id="collection-video-grid"
              primaryCollectionId={id}
              languageId={selectedLanguage?.id}
              subtitleOverride={false}
              titleOverride={false}
              descriptionOverride={false}
              ctaHrefOverride={false}
              ctaLabelOverride={false}
            />
          </div>
          <DialogShare open={showShare} onClose={() => setShowShare(false)} />
        </ContentPageBlurFilter>
      </PageWrapper>
    </>
  )
}
