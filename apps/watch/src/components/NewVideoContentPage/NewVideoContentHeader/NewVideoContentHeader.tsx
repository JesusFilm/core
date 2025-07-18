import ArrowBack from '@mui/icons-material/ArrowBack'
import ChevronRight from '@mui/icons-material/ChevronRight'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../../libs/videoContext'
import { DownloadDialog } from '../../DownloadDialog'
import { ShareDialog } from '../../ShareDialog'
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
  const [showDownload, setShowDownload] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const activeVideoIndex = useMemo(() => {
    return container != null
      ? videos.findIndex((child) => child.id === id) + 1
      : -1
  }, [container, videos, id])

  const childLabel = getLabelDetails(container?.label).childLabel
  const handleShareClick = () => setShowShare(true)
  const handleDownloadClick = () => setShowDownload(true)

  return (
    <div
      className="flex pt-7 z-2 max-w-[1920px] w-full mx-auto relative padded"
      data-testid="NewVideoContentHeader"
    >
      <div className="w-full">
        <div
          className="flex flex-row justify-between items-center"
          data-testid="VideoHeading"
        >
          <div className="flex flex-row items-center space-x-4">
            <NextLink
              href={
                container != null
                  ? `/watch/${container.variant?.slug as string}`
                  : `/watch/`
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold uppercase tracking-wider bg-stone-400/20 hover:bg-stone-400/40 backdrop-blur-md active:bg-stone-100 active:text-stone-900 transition-colors duration-200 text-sm cursor-pointer max-h-10 shadow-sm bevel-top"
              aria-label={container?.title[0].value ?? t('All Videos')}
              tabIndex={0}
            >
              <ArrowBack className="w-4 h-4" />
              {container?.title[0].value ?? t('All Videos')}
            </NextLink>
            {container != null && (
              <>
                <p className="uppercase text-sm tracking-wider text-stone-300/40 hidden xl:block font-bold">
                  <ChevronRight fontSize="small" />
                </p>
                <p className="uppercase text-sm tracking-wider text-stone-300/80  hidden xl:block">
                  {loading === true ? (
                    <Skeleton width={100} height={20} />
                  ) : (
                    <>
                      {childLabel} {activeVideoIndex}
                      {t(' of ')}
                      {container.childrenCount}
                    </>
                  )}
                </p>
              </>
            )}
          </div>
          <div className="flex flex-row gap-2">
            <button
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold uppercase tracking-wider bg-stone-400/20 hover:bg-stone-400/40 backdrop-blur-md active:bg-stone-100 active:text-stone-900 transition-colors duration-200 text-sm cursor-pointer max-h-10 shadow-sm bevel-top"
            >
              <Download2 className="w-4 h-4" />
              {t('Download')}
            </button>

            <button
              onClick={handleShareClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold uppercase tracking-wider bg-stone-400/20 hover:bg-stone-400/40 backdrop-blur-md active:bg-stone-100 active:text-stone-900 transition-colors duration-200 text-sm cursor-pointer max-h-10 shadow-sm bevel-top"
              aria-label={t('Share')}
              tabIndex={0}
            >
              <LinkExternal className="w-4 h-4" />
              {t('Share')}
            </button>
          </div>
          {container != null && (
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
          )}
        </div>
      </div>

      <DownloadDialog
        open={showDownload}
        onClose={() => setShowDownload(false)}
      />
      <ShareDialog open={showShare} onClose={() => setShowShare(false)} />
    </div>
  )
}
