import { sendGTMEvent } from '@next/third-parties/google'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { v4 as uuidv4 } from 'uuid'

import { Icon } from '@core/shared/ui/icons/Icon'

import { BibleQuote } from './BibleQuote'

interface BibleCitation {
  id: string
  videoId: string
  osisId: string
  bibleBookId: string
  order: number
  chapterStart: number
  chapterEnd: number
  verseStart: number
  verseEnd: number
  bibleBook: {
    name: {
      value: string
    }
  }
}

interface BibleQuotesProps {
  contentId: string
  bibleCitations: BibleCitation[]
  onOpenDialog?: () => void
}

export function BibleQuotes({
  contentId,
  bibleCitations,
  onOpenDialog
}: BibleQuotesProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  function handleShareClick() {
    sendGTMEvent({
      event: 'join_study_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId
    })
  }

  return (
    <div className="bible-quotes-block pt-14" data-testid="bible-quotes">
      <div className="flex flex-wrap items-center justify-between mb-6 padded">
        <h4 className="flex items-center gap-4 text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70 flex-shrink-0 py-4">
          {t('Bible Quotes')}
        </h4>

        <button
          onClick={handleShareClick}
          data-testid="ShareButton"
          rel="noopener noreferrer"
          aria-label={t('Share Bible Quote')}
          tabIndex={0}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer flex-shrink-0"
        >
          <Icon
            name="Share"
            sx={{
              width: 16,
              height: 16
            }}
          />
          <span>{t('Share')}</span>
        </button>
      </div>

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
        {bibleCitations.map((citation, index) => (
          <SwiperSlide
            data-testid="BibleQuotesSwiperSlide"
            key={citation.id}
            className={`max-w-[400px] pl-6 xl:pl-12 ${index === 0 ? 'padded-l' : ''}`}
          >
            <BibleQuote
              imageUrl="https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60"
              bgColor="bg-blue-900/80"
            >
              <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                {`${citation.bibleBook.name[0].value} ${citation.chapterStart}:${citation.verseStart}`}
              </span>
              <h3 className="text-base text-white/90 text-balance text-lg">
                {citation.osisId}
              </h3>
            </BibleQuote>
          </SwiperSlide>
        ))}

        <SwiperSlide
          data-testid="BibleQuotesSwiperSlide"
          className="max-w-[400px] pl-6 pr-10 xl:pl-12"
        >
          <BibleQuote
            imageUrl="https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60"
            bgColor="#5F4C5E"
          >
            <span className="text-md tracking-wider uppercase text-white/80">
              {t('Free Resources')}
            </span>
            <h3 className="font-bold text-white/90 text-balance text-2xl mb-4 mt-2">
              {t('Want to grow deep in your understanding of the Bible?')}
            </h3>
            <a
              href="https://join.bsfinternational.org/?utm_source=jesusfilm-watch"
              target="_blank"
            >
              <button
                rel="noopener noreferrer"
                aria-label={t('Join Bible study')}
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
                <span>{t('Join Our Bible study')}</span>
              </button>
            </a>
          </BibleQuote>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}
