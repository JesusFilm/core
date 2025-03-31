import { ReactElement } from 'react'

import { Icon } from '@core/shared/ui/icons/Icon'

interface BibleQuotesCarouselHeaderProps {
  bibleQuotesTitle: string
  onOpenDialog?: () => void
}

export function BibleQuotesCarouselHeader({
  bibleQuotesTitle,
  onOpenDialog
}: BibleQuotesCarouselHeaderProps): ReactElement {
  return (
    <div className="padded">
      <div className="flex items-center justify-between pb-8">
        <div className="flex items-start gap-4">
          <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
            {bibleQuotesTitle}
          </h3>
        </div>
        <button
          onClick={onOpenDialog}
          aria-label="Share Bible quotes"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenDialog?.()
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
          <span>{'Share'}</span>
        </button>
      </div>
    </div>
  )
}
