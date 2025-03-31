/* eslint-disable i18next/no-literal-string */
import Image from 'next/image'
import { ReactElement } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

// Define a type for our content items
interface ContentItem {
  contentId: string
  title: string
  category: string
  image: string
  bgColor: string
}

export function CollectionNavigationCarousel(): ReactElement {
  // Content items data with contentId that will match the CollectionsVideoContent IDs
  const contentItems: ContentItem[] = [
    {
      contentId: 'easter-explained/english',
      title: 'The True Meaning of Easter',
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVhc3RlcnxlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1A1815'
    },
    {
      contentId: 'my-last-day/english',
      title: "Last hour of Jesus' life from criminal's point of view",
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
      bgColor: '#A88E78'
    },
    {
      contentId: 'why-did-jesus-have-to-die/english',
      title: "The Purpose of Jesus' Sacrifice",
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1591561582301-7ce6588cc286?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YnVubnl8ZW58MHx8MHx8fDA%3D',
      bgColor: '#62884C'
    },
    {
      contentId: 'did-jesus-come-back-from-the-dead/english',
      title: "The Truth About Jesus' Resurrection",
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvcGhlY2llc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#5F4C5E'
    },
    {
      contentId: 'the-story-short-film/english',
      title: 'The Story: How It All Began and How It Will Never End',
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
      bgColor: '#72593A'
    },
    {
      contentId: 'chosen-witness/english',
      title: 'Mary Magdalene: A Life Transformed by Jesus',
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1606876538216-0c70a143dd77?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amVzdXMlMjBjcm9zc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1C160B'
    }
  ]

  const handleNavigationClick = (contentId: string) => {
    const element = document.getElementById(contentId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="py-7" data-testid="NavigationCarousel">
      <Swiper
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
            className={`max-w-[200px] ${index === 0 ? 'pl-6 xl:pl-12 2xl:pl-20' : ''} ${index === contentItems.length - 1 ? 'pr-4 md:pr-6,' : ''}`}
            data-testid={`CarouselSlide-${item.contentId.split('/')[0]}`}
          >
            <div
              className={`relative beveled h-[240px] flex flex-col justify-end w-full rounded-lg overflow-hidden cursor-pointer`}
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
                  className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                  data-testid="CarouselItemImage"
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                  data-testid="CarouselItemImg"
                />
              )}
              <div className="p-4">
                <span
                  className="text-xs font-medium tracking-wider uppercase text-amber-100/60"
                  data-testid="CarouselItemCategory"
                >
                  {item.category}
                </span>
                <h3
                  className="text-base font-bold text-white/90 leading-tight line-clamp-3"
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
