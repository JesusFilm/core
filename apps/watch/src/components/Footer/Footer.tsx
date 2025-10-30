import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

  const socialLinks = [
    {
      name: 'X (Twitter)',
      href: 'https://twitter.com/jesusfilm',
      icon: '/assets/footer/x-twitter.svg'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/jesusfilm',
      icon: '/assets/footer/facebook.svg'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/jesusfilm',
      icon: '/assets/footer/instagram.svg'
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/user/jesusfilm',
      icon: '/assets/footer/youtube.svg'
    }
  ]

  return (
    <Container
      component="footer"
      maxWidth="xxl"
      sx={{ backgroundColor: 'background.default', pt: 10, pb: 10 }}
      data-testid="Footer"
    >
      <Stack spacing={7.5}>
        {/* Upper section */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={5}
          flexWrap="wrap"
          rowGap={{ xs: 8, sm: 5 }}
          sx={{
            '& > *:nth-child(1)': { order: 1 },
            '& > *:nth-child(2)': { order: 2 },
            '& > *:nth-child(3)': { order: 3 },
            '& > *:nth-child(4)': { order: { xs: 0, sm: 4 } }
          }}
        >
          {/* Logo */}
          <FooterLink
            url="/"
            label="Jesus Film logo"
            src="/assets/footer/jesus-film-logo.png"
            width={60}
            height={60}
            sx={{ lineHeight: 0 }}
          />

          {/* Social Media Icons */}
          <Stack
            direction="row"
            gap={{ xs: 10, sm: 5 }}
            sx={{
              ml: { sm: 'auto' },
              mr: { sm: 5 },
              flexGrow: { xs: 1, sm: 0 },
              justifyContent: { xs: 'center', sm: 'flex-start' },
              flexBasis: { xs: '100%', sm: 'auto' }
            }}
          >
            {socialLinks.map((link) => (
              <FooterLink
                key={link.name}
                url={link.href}
                label={link.name}
                src={link.icon}
                width={32}
                height={32}
                target="_blank"
                noFollow
                sx={{
                  lineHeight: 0,
                  opacity: '0.77',
                  transition: (theme) => theme.transitions.create('transform'),
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              />
            ))}
          </Stack>

          {/* Navigation Links */}
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            columnGap={{ xs: 10, sm: 5 }}
            rowGap={5}
          >
            {navigationLinks.map((link) => (
              <FooterLink
                key={link.name}
                url={link.href}
                label={link.name}
                sx={{
                  fontSize: 13,
                  lineHeight: { xs: 1.7, sm: 1.2 },
                  fontWeight: 'bold'
                }}
              />
            ))}
          </Stack>

          {/* Give Now Button */}
          <Button
            component="a"
            href="/how-to-help/ways-to-donate/give-now/?amount=&frequency=single&campaign-code=NXWJPO&designation-number=2592320&thankYouRedirect=/dev/special/thank-you-refer/social-share/"
            variant="contained"
            color="primary"
            size="small"
            sx={{
              p: '8px 13px 7px',
              borderRadius: 20,
              lineHeight: '1.1334',
              height: '34px'
            }}
          >
            {t('Give Now', { lng: 'en' })}
          </Button>
        </Stack>

        {/* Lower section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={5}
          rowGap={8}
        >
          <Stack
            direction="row"
            justifyContent={{ xs: 'center', sm: 'flex-start' }}
            flexGrow={1}
            alignItems="center"
            divider={<Divider orientation="vertical" flexItem />}
            gap={5}
          >
            {/* Address and Contact */}
            <Stack>
              <Typography variant="h6" fontSize={12} lineHeight={1.2}>
                {t('100 Lake Hart Drive', { lng: 'en' })}
              </Typography>
              <Typography variant="h6" fontSize={12} lineHeight={1.2}>
                {t('Orlando, FL, 32832', { lng: 'en' })}
              </Typography>
            </Stack>

            <Stack>
              <Typography variant="h6" fontSize={12} lineHeight={1.2}>
                {t('Office: (407) 826-2300', { lng: 'en' })}
              </Typography>
              <Typography variant="h6" fontSize={12} lineHeight={1.2}>
                {t('Fax: (407) 826-2375', { lng: 'en' })}
              </Typography>
            </Stack>
            {/* Legal Links */}
            <Stack>
              <FooterLink
                url="/privacy/"
                label={t('Privacy Policy', { lng: 'en' })}
                sx={{ fontSize: 12, lineHeight: 1.2 }}
              />
              <FooterLink
                url="/legal/"
                label={t('Legal Statement', { lng: 'en' })}
                sx={{ fontSize: 12, lineHeight: 1.2 }}
              />
            </Stack>
          </Stack>
          {/* Newsletter Section */}
          <Stack flexGrow={1} alignItems={{ xs: 'center', sm: 'flex-end' }}>
            <Button
              component="a"
              href="/email/"
              variant="contained"
              size="small"
              sx={{
                backgroundColor: '#333',
                color: 'white',
                p: '8px 13px 7px',
                borderRadius: 20,
                lineHeight: '1.1334',
                height: '34px'
              }}
            >
              {t('Sign Up For Our Newsletter', { lng: 'en' })}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}
