/* eslint-disable i18next/no-literal-string */
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'

export interface OtherCollectionsCarouselProps {
  /** ID for the scroll navigation */
  id: string
  /** Subtitle for the collections section */
  collectionSubtitle: string
  /** Title for the collections section */
  collectionTitle: string
  /** Text for the watch button */
  watchButtonText: string
  /** Mission description text */
  missionDescription: string
  /** Text to highlight in the mission description */
  missionHighlight: string
  /** URLs for movie posters */
  movieUrls: {
    imageUrl: string
    altText: string
    externalUrl: string
  }[]
}

export function OtherCollectionsCarousel({
  id,
  collectionSubtitle,
  collectionTitle,
  watchButtonText,
  missionDescription,
  missionHighlight,
  movieUrls
}: OtherCollectionsCarouselProps): ReactElement {
  return (
    <div
      id={id}
      className="relative bg-linear-to-tr from-blue-950/10  via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always"
      data-testid="OtherCollectionsCarousel"
    >
      <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply"></div>
      <div className="padded z-2 relative pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-1">
              <h4
                className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70"
                data-testid="CollectionSubtitle"
              >
                {collectionSubtitle}
              </h4>

              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="CollectionTitle"
              >
                {collectionTitle}
              </h2>
            </div>
          </div>
          <a
            href="https://www.jesusfilm.org/watch?utm_source=jesusfilm-watch"
            target="_blank"
          >
            <button
              aria-label={watchButtonText}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
              data-testid="WatchButton"
            >
              <Icon
                name="Play3"
                sx={{
                  width: 16,
                  height: 16
                }}
                data-testid="PlayIcon"
              />
              <span>{watchButtonText}</span>
            </button>
          </a>
        </div>
      </div>

      <div className="">
        <Swiper
          modules={[Mousewheel, FreeMode, A11y]}
          mousewheel={{
            forceToAxis: true
          }}
          observeParents
          slidesPerView="auto"
          spaceBetween={0}
          pagination={{ clickable: true }}
          className="w-full"
          data-testid="VideoSwiper"
        >
          {movieUrls.map((movie, index) => (
            <SwiperSlide
              key={`movie-${index}`}
              className={`!w-[296px] pl-6 py-8 relative ${
                index === 0 ? '2xl:pl-20 xl:pl-12' : ''
              }`}
              data-testid={`VideoSlide_${index}`}
            >
              <a
                href={movie.externalUrl}
                target="_blank"
                className="block relative group shadow-xl shadow-stone-950/70 beveled"
                aria-label="Play movie"
              >
                <img
                  src={movie.imageUrl}
                  alt={movie.altText}
                  className="w-full aspect-[2/3] object-cover rounded-lg"
                />

                <div className="absolute top-0 left-0 w-full h-full outline-0 hover:outline-4 hover:outline-white rounded-lg">
                  <div className="absolute z-1 bottom-6 flex items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-24 h-24 rounded-full bg-stone-900/60 flex items-center justify-center hover:bg-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-20 w-20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="padded space-y-6">
        <p className="text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80">
          <span className="text-white font-bold">{missionHighlight}</span>{' '}
          {missionDescription}
        </p>
      </div>
    </div>
  )
}
