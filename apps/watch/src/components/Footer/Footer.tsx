import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FooterLink } from './FooterLink'

export function Footer(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const navigationLinks = [
    { name: t('Share', { lng: 'en' }), href: '/partners/share/' },
    { name: t('Watch', { lng: 'en' }), href: '/watch/' },
    { name: t('Giving', { lng: 'en' }), href: '/give/' },
    { name: t('About', { lng: 'en' }), href: '/about/' },
    { name: t('Products', { lng: 'en' }), href: '/products/' },
    {
      name: t('Resources', { lng: 'en' }),
      href: '/partners/resources/'
    },
    { name: t('Partners', { lng: 'en' }), href: '/partners/' },
    { name: t('Contact', { lng: 'en' }), href: '/contact/' }
  ]

  return (
    <footer className="bg-white" data-testid="Footer">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-10 px-6 py-12 sm:px-10 lg:gap-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 lg:items-center">
            <FooterLink
              url="/"
              label="Jesus Film logo"
              src="/assets/footer/jesus-film-logo.png"
              width={60}
              height={60}
              className="shrink-0"
            />
            <div className="grid grid-cols-1 gap-4 text-sm font-semibold text-gray-900 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span>{t('100 Lake Hart Drive', { lng: 'en' })}</span>
                <span>{t('Orlando, FL, 32832', { lng: 'en' })}</span>
              </div>
              <div className="flex flex-col gap-1 sm:border-l sm:border-gray-200 sm:pl-6">
                <span>{t('Office: (407) 826-2300', { lng: 'en' })}</span>
                <span>{t('Fax: (407) 826-2375', { lng: 'en' })}</span>
              </div>
              <div className="flex flex-col gap-1 sm:border-l sm:border-gray-200 sm:pl-6">
                <FooterLink
                  url="/privacy/"
                  label={t('Privacy Policy', { lng: 'en' })}
                  className="text-xs font-semibold text-gray-900"
                />
                <FooterLink
                  url="/legal/"
                  label={t('Legal Statement', { lng: 'en' })}
                  className="text-xs font-semibold text-gray-900"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:items-end">
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-gray-900"
            >
              {navigationLinks.map((link) => (
                <FooterLink
                  key={link.name}
                  url={link.href}
                  label={link.name}
                  className="text-sm font-semibold text-gray-900"
                />
              ))}
            </nav>
            <a
              href="/how-to-help/ways-to-donate/give-now/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=/dev/special/thank-you-refer/social-share/"
              className="flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#cc2c2c] px-5 text-sm font-semibold text-white transition hover:bg-[#a82323] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc2c2c]"
            >
              {t('Give Now', { lng: 'en' })}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
