import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Icon } from '@core/shared/ui/icons/Icon'

interface BibleQuotesCarouselHeaderProps {
  bibleQuotesTitle: string
  shareButtonText: string
}

export function BibleQuotesCarouselHeader({
  bibleQuotesTitle,
  shareButtonText
}: BibleQuotesCarouselHeaderProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const handleShare = async (): Promise<void> => {
    const shareUrl = new URL(window.location.href)
    shareUrl.searchParams.append('utm_source', 'share')

    const shareData = {
      url: shareUrl.toString(),
      title:
        '👋 Check out these videos about Easter origins. I thought you would like it.',
      text: ''
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard copy if native share is not available
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareUrl.toString()}`
        )
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="padded">
      <div className="flex items-center justify-between pb-8">
        <div className="flex items-start gap-4">
          <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
            {bibleQuotesTitle}
          </h3>
        </div>
        <button
          onClick={handleShare}
          aria-label="Share Bible quotes"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              void handleShare()
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <Icon
            name="LinkExternal"
            sx={{
              width: 16,
              height: 16
            }}
          />
          <span>{shareButtonText}</span>
        </button>
      </div>
    </div>
  )
}
