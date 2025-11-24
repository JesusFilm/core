/* eslint-disable i18next/no-literal-string */
import Image from 'next/image'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

// Define a type for our content items
export interface ContentItem {
  contentId: string
  title: string
  category: string
  image: string
  bgColor: string
}

export interface CollectionNavigationCarouselProps {
  contentItems: ContentItem[]
}

export function CollectionNavigationCarousel({
  contentItems
}: CollectionNavigationCarouselProps): ReactElement {
  const handleNavigationClick = (contentId: string) => {
    const element = document.getElementById(contentId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="py-7" data-testid="NavigationCarousel">
      <Swiper
        modules={[Mousewheel, FreeMode, A11y]}
        mousewheel={{
          forceToAxis: true
        }}
        observeParents
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        spaceBetween={20}
        draggable
        watchOverflow
        data-testid="NavigationCarouselSwiper"
      >
        {contentItems.map((item, index) => (
          <SwiperSlide
            key={item.contentId}
            className={`max-w-[200px] pl-2 ${index === 0 ? 'padded-l' : ''} ${index === contentItems.length - 1 ? 'pr-4 md:pr-6' : ''}`}
            data-testid={`CarouselSlide-${item.contentId.split('/')[0]}`}
          >
            <div
              className={`beveled relative flex h-[240px] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-lg`}
              style={{
                backgroundColor: item.bgColor
              }}
              onClick={() => handleNavigationClick(item.contentId)}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleNavigationClick(item.contentId)
              }
              tabIndex={0}
              role="button"
              aria-label={`Navigate to ${item.title}`}
              data-testid={`CarouselItem-${item.contentId.split('/')[0]}`}
            >
              {index === 0 ? (
                <Image
                  fill
                  src={item.image}
                  alt={item.title}
                  className="absolute top-0 h-[150px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover] object-cover"
                  data-testid="CarouselItemImage"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute top-0 h-[150px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover] object-cover"
                  data-testid="CarouselItemImg"
                />
              )}
              <div className="p-4">
                <span
                  className="text-xs font-medium tracking-wider text-amber-100/60 uppercase"
                  data-testid="CarouselItemCategory"
                >
                  {item.category}
                </span>
                <h3
                  className="line-clamp-3 text-base leading-tight font-bold text-white/90"
                  data-testid={`CarouselItemTitle-${item.contentId.split('/')[0]}`}
                >
                  {item.title}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
