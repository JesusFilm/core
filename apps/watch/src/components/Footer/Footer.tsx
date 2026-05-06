import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { FooterLink } from './FooterLink'

export function Footer(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const gitSha =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    ''
  const shortSha =
    gitSha && process.env.NODE_ENV != 'test'
      ? gitSha.substring(0, 7).toLowerCase()
      : 'dev'
  const projectInfo = `Watch (${shortSha})`

  const socialLinks = [
    {
      name: 'X (Twitter)',
      href: 'https://x.com/jesusfilm',
      icon: '/watch/images/footer/x-twitter.svg'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/jesusfilm',
      icon: '/watch/images/footer/facebook.svg'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/jesusfilm',
      icon: '/watch/images/footer/instagram.svg'
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/user/jesusfilm',
      icon: '/watch/images/footer/youtube.svg'
    }
  ]

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
    <footer
      className="relative z-100 bg-white text-neutral-900"
      data-testid="Footer"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-7 px-4 py-9">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <FooterLink
            href="/"
            label="Jesus Film logo"
            src="/watch/images/footer/jesus-film-logo.png"
            width={60}
            height={60}
          />
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            <div className="mr-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
              {socialLinks.map((link) => (
                <FooterLink
                  key={link.name}
                  href={link.href}
                  label={link.name}
                  src={link.icon}
                  target="_blank"
                  width={32}
                  height={32}
                  labelClassName="h-[32px] w-[32px]"
                  noFollow
                />
              ))}
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold lg:justify-start">
              {navigationLinks.map((link) => (
                <FooterLink
                  key={link.name}
                  href={link.href}
                  label={link.name}
                  labelClassName="text-sm font-semibold leading-6 text-neutral-900"
                />
              ))}
            </nav>
            <FooterLink
              href="https://www.jesusfilm.org/how-to-help/ways-to-donate/give-now?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=/dev/special/thank-you-refer/social-share/"
              label={t('Give Now', { lng: 'en' })}
              className="bg-primary w-[100px] justify-center rounded-full py-1 transition hover:bg-[#ad2625]"
              labelClassName="text-lg text-white"
            />
          </div>
        </div>
        <div className="flex flex-row justify-center gap-4 text-xs font-semibold text-neutral-900 lg:justify-start">
          <div className="flex flex-col border-stone-200">
            <span>{t('100 Lake Hart Drive', { lng: 'en' })}</span>
            <span>{t('Orlando, FL, 32832', { lng: 'en' })}</span>
            <span className="opacity-60">{projectInfo}</span>
          </div>
          <div className="flex flex-col border-l border-stone-200 pl-4">
            <span>{t('Office: (407) 826-2300', { lng: 'en' })}</span>
            <span>{t('Fax: (407) 826-2375', { lng: 'en' })}</span>
          </div>
          <div className="flex flex-col border-l border-stone-200 pl-4">
            {legalLinks.map((link) => (
              <FooterLink
                key={link.name}
                href={link.href}
                label={link.name}
                labelClassName="text-xs"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
