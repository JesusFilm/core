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
                <span className="text-xs font-medium tracking-wider text-amber-100/60 uppercase">
                  {quote.author}:
                </span>
              )}
              <h3 className="text-base text-lg text-balance text-white/90">
                {quote.text}
              </h3>
            </BibleQuote>
          </SwiperSlide>
        ))}

        {freeResource && (
          <SwiperSlide
            data-testid="BibleQuotesSwiperSlide"
            className="max-w-[400px] pr-10 pl-6 xl:pl-12"
          >
            <BibleQuote
              imageUrl={freeResource.imageUrl}
              bgColor={freeResource.bgColor}
            >
              <span className="text-md tracking-wider text-white/80 uppercase">
                {freeResource.subtitle}
              </span>
              <h3 className="mt-2 mb-4 text-2xl font-bold text-balance text-white/90">
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
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold tracking-wider text-black uppercase transition-colors duration-200 hover:bg-white/80"
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
