import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FooterLink } from './FooterLink'

export function Footer(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const navigationLinks = [
    { name: t('Share', { lng: 'en' }), href: '/partners/share' },
    { name: t('Watch', { lng: 'en' }), href: '/watch' },
    { name: t('Giving', { lng: 'en' }), href: '/give' },
    { name: t('About', { lng: 'en' }), href: '/about' },
    { name: t('Products', { lng: 'en' }), href: '/products' },
    {
      name: t('Resources', { lng: 'en' }),
      href: '/partners/resources'
    },
    { name: t('Partners', { lng: 'en' }), href: '/partners' },
    { name: t('Contact', { lng: 'en' }), href: '/contact' }
  ]

  const legalLinks = [
    { name: t('Privacy Policy', { lng: 'en' }), href: '/privacy' },
    { name: t('Legal Statement', { lng: 'en' }), href: '/legal' }
  ]

  return (
    <footer className="bg-white text-neutral-900" data-testid="Footer">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-b border-stone-200 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <FooterLink
              url="/"
              label="Jesus Film logo"
              src="/assets/footer/jesus-film-logo.png"
              width={60}
              height={60}
              className="rounded-md bg-white p-1 shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
            />
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold md:justify-start">
            {navigationLinks.map((link) => (
              <FooterLink
                key={link.name}
                url={link.href}
                label={link.name}
                labelClassName="text-sm font-semibold leading-6 text-neutral-900"
              />
            ))}
          </nav>

          <div className="flex justify-center md:justify-end">
            <FooterLink
              url="/how-to-help/ways-to-donate/give-now?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=/dev/special/thank-you-refer/social-share/"
              label={t('Give Now', { lng: 'en' })}
              className="rounded-full bg-[#c72e2c] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(199,46,44,0.35)] transition hover:bg-[#ad2625] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c72e2c]"
              labelClassName="text-sm font-semibold leading-6 text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-6 text-neutral-700 sm:flex-row sm:flex-wrap sm:items-start sm:gap-10">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="font-semibold text-neutral-900">
              {t('100 Lake Hart Drive', { lng: 'en' })}
            </span>
            <span className="font-semibold text-neutral-900">
              {t('Orlando, FL, 32832', { lng: 'en' })}
            </span>
            <span className="text-neutral-500">
              {t('Resources', { lng: 'en' })} (ff1fd50)
            </span>
          </div>

          <div className="flex flex-col gap-1 border-t border-stone-200 pt-4 text-center sm:border-t-0 sm:border-l sm:pl-6 sm:text-left">
            <span className="font-semibold text-neutral-900">
              {t('Office: (407) 826-2300', { lng: 'en' })}
            </span>
            <span className="font-semibold text-neutral-900">
              {t('Fax: (407) 826-2375', { lng: 'en' })}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-t border-stone-200 pt-4 text-center sm:border-t-0 sm:border-l sm:pl-6 sm:text-left">
            {legalLinks.map((link) => (
              <FooterLink
                key={link.name}
                url={link.href}
                label={link.name}
                labelClassName="text-sm font-semibold leading-6 text-neutral-900"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
