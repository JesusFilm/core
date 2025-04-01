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
                Video Bible Collection
              </h4>

              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="CollectionTitle"
              >
                The Easter story is a key part of a bigger picture
              </h2>
            </div>
          </div>
          <button
            onClick={handleNavigateToWatch}
            aria-label="Share Bible quotes"
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
            <span>Watch</span>
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
              href="https://www.jesusfilm.org/watch/jesus.html/english.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Play movie"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/cfER11"
                alt="JESUS Film Movie Poster"
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
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-john.html/lumo-john-1-1-34/english.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Play movie"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/TxsUi3"
                alt="Gospel of John Film Movie Poster"
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
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-mark.html/lumo-mark-1-1-45/english.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Play movie"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/Ol9PXg"
                alt="Gospel of Mark Film Movie Poster"
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
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-matthew.html/lumo-matthew-1-1-2-23/english.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Play movie"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/zeoyJz"
                alt="Gospel of Matthew Film Movie Poster"
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
              href="https://www.jesusfilm.org/watch/lumo-the-gospel-of-luke.html/lumo-luke-1-1-56/english.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Play movie"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/cft9yz"
                alt="Gospel of Luke Film Movie Poster"
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
              href="https://www.jesusfilm.org/watch/life-of-jesus-gospel-of-john.html/english.html"
              target="_blank"
              className="block relative group shadow-xl shadow-stone-950/70 beveled"
              aria-label="Play movie"
            >
              <img
                src="https://cdn-std.droplr.net/files/acc_760170/9wGrB0"
                alt="The Life of Jesus Movie Poster"
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
          <span className="text-white font-bold">Our mission</span> is to
          introduce introduce people to the Bible through films and videos that
          faithfully bring the Gospels to life. By visually telling the story of
          Jesus and God's love for humanity, we make Scripture more accessible,
          engaging, and easy to understand.
        </p>
      </div>
    </div>
  )
}
