/* eslint-disable i18next/no-literal-string */
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'

export function OtherCollectionsCarousel(): ReactElement {
  const router = useRouter()

  const handleNavigateToWatch = (): void => {
    void router.push('/watch')
  }

  return (
    <div
      className="relative bg-linear-to-tr from-blue-950/10  via-purple-950/10 to-[#91214A]/90 py-16"
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
                Коллекция Видео Библии
              </h4>

              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="CollectionTitle"
              >
                История Пасхи - важная часть большой картины
              </h2>
            </div>
          </div>
          <button
            onClick={handleNavigateToWatch}
            aria-label="Поделиться цитатами из Библии"
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
            <span>Смотреть</span>
          </button>
        </div>
      </div>

      <div className="">
        <Swiper
          slidesPerView="auto"
          spaceBetween={0}
          pagination={{ clickable: true }}
          className="w-full"
          data-testid="VideoSwiper"
        >
          <SwiperSlide
            className="!w-[296px] pl-6 py-8 relative 2xl:pl-20 xl:pl-12"
            data-testid="VideoSlide_JesusFilm"
          >
            <a
              href="https://www.jesusfilm.org/watch/jesus.html/russian.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Воспроизвести фильм"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/cfER11"
                alt="Постер фильма ИИСУС"
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

          <SwiperSlide className="!w-[296px] pl-6 py-8 relative">
            <a
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-john.html/lumo-john-1-1-34/russian.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Воспроизвести фильм"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/TxsUi3"
                alt="Постер фильма Евангелие от Иоанна"
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

          <SwiperSlide className="!w-[296px] pl-6 py-8 relative">
            <a
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-mark.html/lumo-mark-1-1-45/russian.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Воспроизвести фильм"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/Ol9PXg"
                alt="Постер фильма Евангелие от Марка"
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

          <SwiperSlide className="!w-[296px] pl-6 py-8 relative">
            <a
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-matthew.html/lumo-matthew-1-1-2-23/russian.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Воспроизвести фильм"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/zeoyJz"
                alt="Постер фильма Евангелие от Матфея"
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

          <SwiperSlide className="!w-[296px] pl-6 py-8 relative">
            <a
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-luke.html/lumo-luke-1-1-56/russian.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Воспроизвести фильм"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/cft9yz"
                alt="Постер фильма Евангелие от Луки"
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

          <SwiperSlide className="!w-[296px] pl-6 py-8 relative">
            <a
              href="https://www.jesusfilm.org/watch/life-of-jesus-gospel-of-john.html/russian.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Воспроизвести фильм"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/9wGrB0"
                alt="Постер фильма Жизнь Иисуса"
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
        </Swiper>
      </div>

      <div className="padded space-y-6">
        <p className="text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80">
          <span className="text-white font-bold">Наша миссия</span> - знакомить
          людей с Библией через фильмы и видео, которые достоверно воплощают
          Евангелия в жизнь. Визуально рассказывая историю Иисуса и Божьей любви
          к человечеству, мы делаем Писание более доступным, увлекательным и
          понятным.
        </p>
      </div>
    </div>
  )
}
