import { sendGTMEvent } from '@next/third-parties/google'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { v4 as uuidv4 } from 'uuid'

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
  contentId: string
  bibleQuotes: BibleQuoteData[]
  bibleQuotesTitle: string
  freeResource?: FreeResourceData
  onOpenDialog?: () => void
  shareButtonText: string
  shareDataTitle: string
}

export function BibleQuotesCarousel({
  contentId,
  bibleQuotes,
  bibleQuotesTitle,
  freeResource,
  onOpenDialog,
  shareButtonText,
  shareDataTitle
}: BibleQuotesCarouselProps): ReactElement {
  function handleShareClick() {
    sendGTMEvent({
      event: 'join_study_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId
    })
  }

  return (
    <div
      className="bible-quotes-block pt-14"
      data-testid="bible-quotes-carousel"
    >
      <BibleQuotesCarouselHeader
        contentId={contentId}
        bibleQuotesTitle={bibleQuotesTitle}
        shareButtonText={shareButtonText}
        shareDataTitle={shareDataTitle}
      />
      <Swiper
        modules={[Mousewheel, FreeMode, A11y]}
        grabCursor
        observeParents
        mousewheel={{
          forceToAxis: true
        }}
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
            className={`max-w-[400px] pl-6 xl:pl-12 ${index === 0 ? 'padded-l' : ''}`}
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
              <a
                href="https://join.bsfinternational.org/?utm_source=jesusfilm-watch"
                target="_blank"
              >
                <button
                  rel="noopener noreferrer"
                  aria-label="Join Bible study"
                  tabIndex={0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-white/80 transition-colors duration-200 cursor-pointer"
                  onClick={handleShareClick}
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
              </a>
            </BibleQuote>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  )
}
