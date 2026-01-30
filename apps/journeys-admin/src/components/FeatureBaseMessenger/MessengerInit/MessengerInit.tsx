import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import Script from 'next/script'
import { ReactElement, useEffect, useState } from 'react'

import { FeatureBaseUserInfo } from '@core/journeys/ui/messengerHooks'

interface MessengerInitProps {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
  userInfo?: FeatureBaseUserInfo
}

export function MessengerInit({
  loaded,
  setLoaded,
  userInfo
}: MessengerInitProps): ReactElement {
  const { zIndex, palette } = useTheme()
  const router = useRouter()
  const { i18n } = useTranslation('apps-journeys-admin')

  // Auto-detect theme from MUI
  const theme = palette.mode === 'dark' ? 'dark' : 'light'
  // Get current i18n language
  const language = i18n?.language ?? 'en'

  useEffect(() => {
    const win = window

    // Initialize Featurebase if it doesn't exist
    if (typeof win.Featurebase !== 'function') {
      win.Featurebase = function (
        fn: 'boot',
        config: {
          appId: string
          email?: string
          userId?: string
          createdAt?: string
          theme?: 'light' | 'dark'
          language?: string
        }
      ) {
        if (win.Featurebase == null) return
        if (win.Featurebase.q == null) {
          win.Featurebase.q = []
        }
        win.Featurebase.q.push([fn, config])
      }
    }

    // Boot Featurebase messenger with configuration
    // This will be queued if script hasn't loaded yet
    if (win.Featurebase != null) {
      win.Featurebase('boot', {
        appId: '6942112b425881f42d3171fb',
        email: userInfo?.email,
        userId: userInfo?.userId,
        createdAt: userInfo?.createdAt,
        theme: userInfo?.theme ?? theme,
        language: userInfo?.language ?? language
      })
    }
  }, [loaded, userInfo, theme, language])

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (): void => {
      // Re-boot on route change to ensure proper state
      if (window.Featurebase != null) {
        window.Featurebase('boot', {
          appId: '6942112b425881f42d3171fb',
          email: userInfo?.email,
          userId: userInfo?.userId,
          createdAt: userInfo?.createdAt,
          theme: userInfo?.theme ?? theme,
          language: userInfo?.language ?? language
        })
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router, userInfo, theme, language])

  return (
    <>
      <Script
        src="https://do.featurebase.app/js/sdk.js"
        id="featurebase-sdk"
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
      />
      <style>{`
        #featurebase-messenger-container {
          z-index: ${zIndex.modal + 1} !important;
        }
      `}</style>
    </>
  )
}
