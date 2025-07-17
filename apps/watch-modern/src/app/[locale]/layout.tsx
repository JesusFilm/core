'use client'

import { Inter } from 'next/font/google'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation('apps-watch-modern')

  return (
    <html lang="en">
      <Head>
        <title>{t('Watch Modern')}</title>
        <meta name="description" content="Your modern streaming platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto p-4">
              <nav className="flex items-center justify-between">
                <h1 className="text-xl font-bold">{t('Watch Modern')}</h1>
                <div className="space-x-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    {t('Home')}
                  </Link>
                  <Link
                    href="/new-page"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t('New Page')}
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          {children}
          <footer className="border-t mt-auto">
            <div className="container mx-auto p-4 text-center text-sm text-gray-600">
              © {new Date().getFullYear()} {t('Watch Modern')}.{' '}
              {t('All rights reserved.')}
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
