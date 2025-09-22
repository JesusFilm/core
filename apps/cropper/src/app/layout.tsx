import './global.css'
import 'video.js/dist/video-js.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import { ApolloProvider } from '../components/ApolloProvider'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Vertical Crop Studio',
  description: 'Intuitive 9:16 reframing workspace with AI-assisted tracking and export presets.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-stone-950 text-stone-100`}>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  )
}
