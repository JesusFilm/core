import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { type ReactElement } from 'react'
import { A11y, FreeMode } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { type SwiperOptions } from 'swiper/types'

interface PartnerLogo {
  name: string
  logoSrc: string
  alt: string
}

const partnerLogos: PartnerLogo[] = [
  {
    name: 'Hazard Media',
    logoSrc: '/assets/partners/hazard-media.svg',
    alt: 'Hazard Media logo'
  },
  {
    name: 'Global Hope',
    logoSrc: '/assets/partners/global-hope.svg',
    alt: 'Global Hope logo'
  },
  {
    name: 'Faith Motion',
    logoSrc: '/assets/partners/faith-motion.svg',
    alt: 'Faith Motion logo'
  },
  {
    name: 'Mission Proclaim',
    logoSrc: '/assets/partners/mission-proclaim.svg',
    alt: 'Mission Proclaim logo'
  },
  {
    name: 'Radiant Network',
    logoSrc: '/assets/partners/radiant-network.svg',
    alt: 'Radiant Network logo'
  }
]

const swiperBreakpoints: SwiperOptions['breakpoints'] = {
  0: {
    slidesPerView: 1.3,
    spaceBetween: 16
  },
  640: {
    slidesPerView: 2.1,
    spaceBetween: 20
  },
  1024: {
    slidesPerView: 3.1,
    spaceBetween: 24
  },
  1440: {
    slidesPerView: 4.1,
    spaceBetween: 28
  }
}

export function SectionPartners(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const headingId = 'section-partners-heading'

  return (
    <section
      aria-labelledby={headingId}
      data-testid="SectionPartners"
      className="w-full py-16 sm:py-20"
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 text-white max-w-4xl">
          <h2 id={headingId} className="text-3xl font-semibold md:text-4xl">
            {t('Our Partners')}
          </h2>
          <p className="text-base text-slate-200 md:text-lg">
            {t(
              'Jesus Film is a media and software ministry partnering with Hazard Media-oriented missions to benefit missionaries around the world who are ready to share visually rich, media-rich content.'
            )}
          </p>
        </div>
        <Swiper
          modules={[A11y, FreeMode]}
          data-testid="SectionPartnersCarousel"
          aria-label={t('Our Partners')}
          breakpoints={swiperBreakpoints}
          freeMode
          slidesPerView={1.3}
          spaceBetween={16}
          className="!overflow-visible"
        >
          {partnerLogos.map((partner) => (
            <SwiperSlide key={partner.name} data-testid="SectionPartnersSlide">
              <div className="h-32 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.35)] backdrop-blur flex items-center justify-center">
                <Image
                  src={partner.logoSrc}
                  alt={partner.alt}
                  width={240}
                  height={120}
                  className="h-full w-auto max-h-20"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div>
          <a
            href="mailto:partners@jesusfilm.org"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(15,23,42,0.45)] transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t('Become a Partner')}
          </a>
        </div>
      </div>
    </section>
  )
}
