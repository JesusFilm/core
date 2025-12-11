'use client'

import Image from 'next/image'
import { ReactElement } from 'react'

import logo from './assets/logo-sign.svg'

export function TopNavBar(): ReactElement {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white">
      <div className="flex h-20 items-center px-4 lg:px-8">
        <div className="flex items-center">
          <Image
            src={logo}
            alt="Jesus Film Logo"
            width={126}
            height={40}
            className="h-8 w-auto"
            priority
            unoptimized
          />
        </div>
      </div>
    </nav>
  )
}
