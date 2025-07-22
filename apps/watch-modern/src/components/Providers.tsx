'use client'

import { NextIntlClientProvider } from 'next-intl'

interface ProvidersProps {
  locale: string
  messages: any
  children: React.ReactNode
}

export default function Providers({
  locale,
  messages,
  children
}: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
