import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { useVideo } from '../../../libs/videoContext'
import { Skeleton } from '../../Skeleton'

interface VideoContentHeaderProps {
  loading?: boolean
  videos?: VideoChildFields[]
}

export function NewVideoContentHeader({
  loading,
  videos = []
}: VideoContentHeaderProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { id, container } = useVideo()

  const activeVideoIndex = useMemo(() => {
    return container != null
      ? videos.findIndex((child) => child.id === id) + 1
      : -1
  }, [container, videos, id])

  return (
    <div
      className="flex pt-7 z-2 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-[1920px] w-full mx-auto relative"
      data-testid="NewVideoContentHeader"
    >
      {container != null && (
        <div className="w-full">
          <div
            className="flex flex-row justify-between items-center"
            data-testid="VideoHeading"
          >
            <div className="flex flex-row items-center space-x-4">
              <NextLink
                href={`/watch/${container.variant?.slug as string}`}
                passHref
                legacyBehavior
              >
                <a className="uppercase text-sm tracking-wider text-primary no-underline">
                  {container.title[0].value}
                </a>
              </NextLink>
              <p className="uppercase text-sm tracking-wider text-[#bbbcbc]  hidden xl:block font-bold">
                •
              </p>
              <p className="uppercase text-sm tracking-wider text-[#bbbcbc]  hidden xl:block">
                {loading === true ? (
                  <Skeleton width={100} height={20} />
                ) : (
                  <>
                    {t('Clip ')}
                    {activeVideoIndex}
                    {t(' of ')}
                    {container.childrenCount}
                  </>
                )}
              </p>
            </div>
            <NextLink
              href={`/watch/${container.variant?.slug as string}`}
              passHref
              legacyBehavior
            >
              <button className="border border-[#bbbcbc] rounded-md px-2 py-1 text-sm text-[#bbbcbc] hidden xl:block cursor-pointer font-bold">
                {container.label === VideoLabel.featureFilm
                  ? 'Watch Full Film'
                  : 'See All'}
              </button>
            </NextLink>
            <p
              data-testid="container-progress-short"
              className="uppercase text-xs tracking-wider text-[#bbbcbc] block xl:hidden"
            >
              {loading === true ? (
                <Skeleton width={100} height={20} />
              ) : (
                <>
                  {activeVideoIndex}/{container.childrenCount}
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
