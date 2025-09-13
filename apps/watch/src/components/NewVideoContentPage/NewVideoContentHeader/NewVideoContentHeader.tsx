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
      className="flex z-2 py-6 responsive-container relative"
      data-testid="NewVideoContentHeader"
    >
      {container != null && (
        <div className="w-full">
          <div
            className="flex flex-row justify-between items-center"
            data-testid="VideoHeading"
          >
            <div className="flex flex-row items-center space-x-4">
              {container.variant?.slug != null ? (
                <NextLink
                  href={`/watch/${container.variant.slug}`}
                  locale={false}
                  className="uppercase text-sm tracking-wider text-primary no-underline"
                >
                  {last(container.title)?.value}
                </NextLink>
              ) : (
                <span className="uppercase text-sm tracking-wider text-primary no-underline">
                  {last(container.title)?.value}
                </span>
              )}
              <p className="uppercase text-sm tracking-wider text-[#bbbcbc]  hidden xl:block font-bold">
                •
              </p>
              <div className="uppercase text-sm tracking-wider text-[#bbbcbc]  hidden xl:block">
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
              </div>
            </div>
            {container.variant?.slug != null ? (
              <NextLink
                href={`/watch/${container.variant.slug}`}
                locale={false}
                passHref
              >
                <button className="border border-[#bbbcbc] rounded-md px-2 py-1 text-sm text-[#bbbcbc] hidden xl:block cursor-pointer font-bold">
                  {container.label === VideoLabel.featureFilm
                    ? 'Watch Full Film'
                    : 'See All'}
                </button>
              </NextLink>
            ) : (
              <button className="border border-[#bbbcbc] rounded-md px-2 py-1 text-sm text-[#bbbcbc] hidden xl:block cursor-pointer font-bold">
                {container.label === VideoLabel.featureFilm
                  ? 'Watch Full Film'
                  : 'See All'}
              </button>
            )}
            <div
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
