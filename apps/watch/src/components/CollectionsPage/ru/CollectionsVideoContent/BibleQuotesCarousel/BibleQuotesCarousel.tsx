import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'

import { BibleQuote } from '../BibleQuote'

import { BibleQuotesCarouselHeader } from './BibleQuotesCarouselHeader'

interface BibleQuoteData {
  imageUrl: string
  bgColor: string
  author?: string
  text: string
}

interface FreeResourceData {
  imageUrl: string
  bgColor: string
  title: string
  subtitle: string
  buttonText: string
}

interface BibleQuotesCarouselProps {
  bibleQuotes: BibleQuoteData[]
  bibleQuotesTitle: string
  freeResource?: FreeResourceData
  onOpenDialog?: () => void
}

export function BibleQuotesCarousel({
  bibleQuotes,
  bibleQuotesTitle,
  freeResource,
  onOpenDialog
}: BibleQuotesCarouselProps): ReactElement {
  return (
    <div
      className="bible-quotes-block pt-14"
      data-testid="bible-quotes-carousel"
    >
      <BibleQuotesCarouselHeader
        bibleQuotesTitle={bibleQuotesTitle}
        onOpenDialog={onOpenDialog}
      />
      <Swiper
        modules={[Mousewheel, FreeMode, A11y]}
        observeParents
        mousewheel={{
          forceToAxis: true
        }}
        freeMode
        watchOverflow
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        spaceBetween={0}
        style={{
          overflow: 'visible'
        }}
      >
        {bibleQuotes.map((quote, index) => (
          <SwiperSlide
            data-testid="BibleQuotesSwiperSlide"
            key={index}
            className={`max-w-[400px] pl-6 ${index === 0 ? '2xl:pl-20' : ''} xl:pl-12`}
          >
            <BibleQuote imageUrl={quote.imageUrl} bgColor={quote.bgColor}>
              {quote.author && (
                <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                  {quote.author}:
                </span>
              )}
              <h3 className="text-base text-white/90 text-balance text-lg">
                {quote.text}
              </h3>
            </BibleQuote>
          </SwiperSlide>
        ))}

        {freeResource && (
          <SwiperSlide
            data-testid="BibleQuotesSwiperSlide"
            className="max-w-[400px] pl-6 pr-10 xl:pl-12"
          >
            <BibleQuote
              imageUrl={freeResource.imageUrl}
              bgColor={freeResource.bgColor}
            >
              <span className="text-md tracking-wider uppercase text-white/80">
                {freeResource.subtitle}
              </span>
              <h3 className="font-bold text-white/90 text-balance text-2xl mb-4 mt-2">
                {freeResource.title}
              </h3>
              <button
                onClick={onOpenDialog}
                aria-label="Join Bible study"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onOpenDialog?.()
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-white/80 transition-colors duration-200 cursor-pointer"
              >
                <Icon
                  name="Bible"
                  sx={{
                    width: 16,
                    height: 16
                  }}
                />
                <span>{freeResource.buttonText}</span>
              </button>
            </BibleQuote>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  )
}
