import { useQuery } from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import last from 'lodash/last'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Bible from '@core/shared/ui/icons/Bible'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import { ThemeMode } from '@core/shared/ui/themes'

import { GetLanguagesSlug } from '../../../__generated__/GetLanguagesSlug'
import { VideoContentFields_studyQuestions as StudyQuestions } from '../../../__generated__/VideoContentFields'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import { useWatch } from '../../libs/watchContext'
import { audioLanguageRedirect } from '../../libs/watchContext/audioLanguageRedirect'
import { GET_LANGUAGES_SLUG } from '../AudioLanguageDialog/AudioLanguageDialog'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'

import { BibleCitations } from './BibleCitations'
import { ContentMetadata } from './ContentMetadata'
import { ContentPageBlurFilter } from './ContentPageBlurFilter'
import { DiscussionQuestions } from './DiscussionQuestions'
import { NewVideoContentHeader } from './NewVideoContentHeader'
import { VideoCarousel } from './VideoCarousel'
import { VideoContentHero } from './VideoContentHero'

export function NewVideoContentPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
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
    bibleCitations,
    childrenCount
  } = useVideo()

  const [showShare, setShowShare] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { dispatch } = useWatch()

  const variantSlug = container?.variant?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)

  const { children, loading } = useVideoChildren(
    variantSlug,
    variant?.language.bcp47 ?? 'en'
  )

  const { loading: languageVariantsLoading, data: languageVariantsData } =
    useQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
      variables: {
        id
      },
      onCompleted: (data) => {
        if (data?.video?.variantLanguagesWithSlug) {
          dispatch({
            type: 'SetVideoAudioLanguages',
            videoAudioLanguages: data.video.variantLanguagesWithSlug
          })
        }
      }
    })

  // Handle locale checking and redirect
  useEffect(() => {
    void audioLanguageRedirect({
      languageVariantsLoading,
      languageVariantsData,
      router,
      containerSlug: container?.slug
    })
  }, [languageVariantsLoading, languageVariantsData, router, container?.slug])

  const filteredChildren = useMemo(
    () => children.filter((video) => video.variant !== null),
    [children]
  )

  const questions = useMemo(() => {
    if (!studyQuestions?.length)
      return [
        {
          value: t(
            'If you could ask the creator of this video a question, what would it be?'
          )
        }
      ] as unknown as StudyQuestions[]

    const { nonPrimary, primary } = studyQuestions.reduce(
      (acc, q) => {
        if (q.primary === false) {
          acc.nonPrimary.push(q)
        } else if (q.primary === true) {
          acc.primary.push(q)
        }
        return acc
      },
      {
        nonPrimary: [] as StudyQuestions[],
        primary: [] as StudyQuestions[]
      }
    )

    if (nonPrimary.length > 0) {
      return nonPrimary
    }

    if (primary.length > 0) {
      return primary
    }

    return [
      {
        value: t(
          'If you could ask the creator of this video a question, what would it be?'
        )
      }
    ] as unknown as StudyQuestions[]
  }, [studyQuestions])

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
        title={last(title)?.value}
        description={last(snippet)?.value ?? undefined}
        openGraph={{
          type: 'website',
          title: last(title)?.value,
          url: `${
            process.env.NEXT_PUBLIC_WATCH_URL ??
            'https://watch-jesusfilm.vercel.app'
          }${watchUrl}`,
          description: last(snippet)?.value ?? undefined,
          images:
            last(images)?.mobileCinematicHigh != null
              ? [
                  {
                    url: last(images)?.mobileCinematicHigh ?? '',
                    width: 1080,
                    height: 600,
                    alt: last(imageAlt)?.value ?? '',
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
          <VideoContentHero
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
          />
        }
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
        isFullscreen={isFullscreen}
      >
        <ContentPageBlurFilter>
          <NewVideoContentHeader loading={loading} videos={filteredChildren} />
          {((container?.childrenCount ?? 0) > 0 || childrenCount > 0) &&
            (filteredChildren.length === children.length ||
              filteredChildren.length > 0) && (
              <VideoCarousel
                videos={filteredChildren}
                containerSlug={container?.slug ?? videoSlug}
                activeVideoId={id}
                loading={loading}
              />
            )}
          <div
            data-testid="ContentPageContent"
            className="flex flex-col gap-20 py-20 z-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] w-full mx-auto"
          >
            <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] z-10 gap-20">
              <ContentMetadata
                title={last(title)?.value ?? ''}
                description={last(description)?.value ?? ''}
                label={label}
              />
              <DiscussionQuestions questions={questions} />
            </div>
            <div className="z-10 flex flex-row gap-2 justify-between">
              <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
                {t('Bible Quotes')}
              </h3>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => setShowShare(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 font-bold uppercase tracking-wider bg-white hover:bg-[#cb333b] hover:text-white transition-colors duration-200 text-sm cursor-pointer"
                >
                  <LinkExternal className="w-4 h-4" />
                  {t('Share')}
                </button>
              </div>
              <ShareDialog
                open={showShare}
                onClose={() => setShowShare(false)}
              />
            </div>
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
          </div>
        </ContentPageBlurFilter>
      </PageWrapper>
    </>
  )
}
