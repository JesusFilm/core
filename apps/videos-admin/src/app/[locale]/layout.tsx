import DashboardIcon from '@mui/icons-material/Dashboard'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { AppProvider } from '@toolpad/core/nextjs'
import Image from 'next/image'
import { SessionProvider, signIn, signOut } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ReactElement, ReactNode } from 'react'

import { auth } from '../../auth'
import { theme } from '../../theme'

import logo from './logo.png'

interface RootLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps): Promise<ReactElement> {
  const session = await auth()
  const messages = await getMessages()

  return (
    <html lang={locale} data-toolpad-color-scheme="light">
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider session={session}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <AppProvider
                navigation={[
                  {
                    segment: '',
                    title: 'Dashboard',
                    icon: <DashboardIcon />
                  },
                  {
                    segment: 'videos',
                    title: 'Videos',
                    icon: <VideoLibraryIcon />
                  }
                ]}
                branding={{
                  title: 'JFP Media Admin',
                  logo: (
                    <Image
                      src={logo}
                      width="40"
                      height="40"
                      alt="Jesus Film Project"
                    />
                  )
                }}
                session={session}
                theme={theme}
                authentication={{
                  signIn,
                  signOut
                }}
              >
                {children}
              </AppProvider>
            </AppRouterCacheProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
