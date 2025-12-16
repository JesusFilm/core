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

  return (
    <footer className="bg-white" data-testid="Footer">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-10 px-4 py-12 text-neutral-900 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
            <FooterLink
              className="rounded-xl p-2 hover:text-neutral-900"
              href="/"
              iconHeight={60}
              iconSrc="/assets/footer/jesus-film-logo.png"
              iconWidth={60}
              label="Jesus Film logo"
            />

            <div className="flex flex-col gap-4 text-sm text-neutral-700 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex flex-col gap-1 leading-6">
                <span className="font-semibold text-neutral-900">
                  {t('100 Lake Hart Drive', { lng: 'en' })}
                </span>
                <span className="font-semibold text-neutral-900">
                  {t('Orlando, FL, 32832', { lng: 'en' })}
                </span>
                <span className="text-neutral-500">Resources (1ff1d50)</span>
              </div>

              <div className="hidden h-16 w-px bg-neutral-200 sm:block" aria-hidden="true" />

              <div className="flex flex-col gap-1 leading-6">
                <span className="font-semibold text-neutral-900">
                  {t('Office: (407) 826-2300', { lng: 'en' })}
                </span>
                <span className="font-semibold text-neutral-900">
                  {t('Fax: (407) 826-2375', { lng: 'en' })}
                </span>
              </div>

              <div className="hidden h-16 w-px bg-neutral-200 sm:block" aria-hidden="true" />

              <div className="flex flex-col gap-1 leading-6 text-neutral-800">
                <FooterLink
                  href="/privacy"
                  label={t('Privacy Policy', { lng: 'en' })}
                  textClassName="text-sm font-semibold leading-6 text-neutral-800 hover:text-neutral-600"
                />
                <FooterLink
                  href="/legal"
                  label={t('Legal Statement', { lng: 'en' })}
                  textClassName="text-sm font-semibold leading-6 text-neutral-800 hover:text-neutral-600"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end lg:gap-6">
            <nav
              aria-label="Footer main navigation"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base font-semibold leading-6 text-neutral-900 lg:justify-end"
            >
              {navigationLinks.map((link) => (
                <FooterLink
                  key={link.name}
                  className="hover:text-neutral-700"
                  href={link.href}
                  label={link.name}
                  textClassName="text-base font-semibold leading-6 text-neutral-900"
                />
              ))}
            </nav>

            <a
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold leading-6 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              href="/how-to-help/ways-to-donate/give-now/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=/dev/special/thank-you-refer/social-share/"
            >
              {t('Give Now', { lng: 'en' })}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
