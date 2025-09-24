import { sendGTMEvent } from '@next/third-parties/google'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Icon } from '@core/shared/ui/icons/Icon'

import { Button } from '../../../../Button'

interface BibleQuotesCarouselHeaderProps {
  bibleQuotesTitle: string
  shareButtonText: string
  shareDataTitle: string
  contentId: string
}

export function BibleQuotesCarouselHeader({
  bibleQuotesTitle,
  shareButtonText,
  shareDataTitle,
  contentId
}: BibleQuotesCarouselHeaderProps): ReactElement {
  const handleShare = async (): Promise<void> => {
    const shareUrl = new URL(window.location.href)
    shareUrl.searchParams.append('utm_source', 'share')

    const shareData = {
      url: shareUrl.toString(),
      title: shareDataTitle,
      text: ''
    }

    sendGTMEvent({
      event: 'share_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId
    })

    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback to clipboard copy if native share is not available
      await navigator.clipboard.writeText(
        `${shareData.text}\n\n${shareUrl.toString()}`
      )
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
        <Button
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
        </Button>
      </div>
    </div>
  )
}
