import last from 'lodash/last'
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
      className="relative z-2 mx-auto flex w-full max-w-[1920px] px-4 pt-7 sm:px-6 md:px-8 lg:px-10 xl:px-12"
      data-testid="NewVideoContentHeader"
    >
      {container != null && (
        <div className="w-full">
          <div
            className="flex flex-row items-center justify-between"
            data-testid="VideoHeading"
          >
            <div className="flex flex-row items-center space-x-4">
              {container.variant?.slug != null ? (
                <NextLink
                  href={`/watch/${container.variant.slug}`}
                  locale={false}
                  className="text-primary text-sm tracking-wider uppercase no-underline"
                >
                  {last(container.title)?.value}
                </NextLink>
              ) : (
                <span className="text-primary text-sm tracking-wider uppercase no-underline">
                  {last(container.title)?.value}
                </span>
              )}
              <p className="hidden text-sm font-bold tracking-wider text-[#bbbcbc] uppercase xl:block">
                •
              </p>
              <p className="hidden text-sm tracking-wider text-[#bbbcbc] uppercase xl:block">
                {loading === true ? (
                  <Skeleton width={100} height={20} />
                ) : (
                  <>
                    {t('Clip ')}
                    {activeVideoIndex}
                    {t(' of ')}
                    {videos.length != 0
                      ? videos.length
                      : container.childrenCount}
                  </>
                )}
              </p>
            </div>
            {container.variant?.slug != null ? (
              <NextLink
                href={`/watch/${container.variant.slug}`}
                locale={false}
                passHref
              >
                <button className="hidden cursor-pointer rounded-md border border-[#bbbcbc] px-2 py-1 text-sm font-bold text-[#bbbcbc] xl:block">
                  {container.label === VideoLabel.featureFilm
                    ? 'Watch Full Film'
                    : 'See All'}
                </button>
              </NextLink>
            ) : (
              <button className="hidden cursor-pointer rounded-md border border-[#bbbcbc] px-2 py-1 text-sm font-bold text-[#bbbcbc] xl:block">
                {container.label === VideoLabel.featureFilm
                  ? 'Watch Full Film'
                  : 'See All'}
              </button>
            )}
            <p
              data-testid="container-progress-short"
              className="block text-xs tracking-wider text-[#bbbcbc] uppercase xl:hidden"
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
