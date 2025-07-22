import { Inter } from 'next/font/google'
import { getMessages } from 'next-intl/server'

import Providers from '../components/Providers'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
