'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'

import AppStoreIcon from './assets/app-store-english.svg'
import GooglePlayIcon from './assets/google-play-english.svg'

import { env } from '@/env'

type Platform = 'ios' | 'android' | 'other'

export function usePlatformDetection(): Platform {
  if (typeof navigator === 'undefined') return 'other'

  const ua = navigator.userAgent || navigator.vendor || ''

  if (/android/i.test(ua)) {
    return 'android'
  }

  if (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as Mac, so detect touch + Mac platform
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    return 'ios'
  }

  return 'other'
}

interface SharedPlaylistBannerProps {
  name: string
}

export function SharedPlaylistBanner({
  name
}: SharedPlaylistBannerProps): ReactElement | null {
  const t = useTranslations('SharedPlaylistBanner')
  const [isDismissed, setIsDismissed] = useState(true)
  const platform = usePlatformDetection()

  useEffect(() => {
    const dismissedKey = 'shared-playlist-banner-dismissed'
    const dismissed = localStorage.getItem(dismissedKey)
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    setIsDismissed(false)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('shared-playlist-banner-dismissed', 'true')
    setIsDismissed(true)
  }

  if (isDismissed || platform === 'ios') {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-start justify-between gap-4 md:items-center">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 text-sm text-gray-900 dark:text-gray-100">
            {t.rich('sharedWithYou', {
              name: name,
              strong: (chunks) => (
                <span className="font-semibold">{chunks}</span>
              )
            })}
          </div>
          <div className="flex flex-row gap-4">
            {platform === 'other' && (
              <a
                href={`https://apps.apple.com/app/id${env.NEXT_PUBLIC_IOS_APP_ID}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={AppStoreIcon}
                  alt="Download on App Store"
                  height={40}
                />
              </a>
            )}
            {
              <a
                href={`https://play.google.com/store/apps/details?id=${env.NEXT_PUBLIC_ANDROID_APP_ID}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={GooglePlayIcon}
                  alt="Get it on Google Play"
                  height={40}
                />
              </a>
            }
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Dismiss banner"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
