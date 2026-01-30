import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import Script from 'next/script'
import { ReactElement, useEffect, useState } from 'react'

interface ChangelogInitProps {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
  userName?: string
}

export function ChangelogInit({
  loaded,
  setLoaded,
  userName
}: ChangelogInitProps): ReactElement {
  const { palette } = useTheme()
  const { i18n } = useTranslation('apps-journeys-admin')

  // Auto-detect theme from MUI
  const theme = palette.mode === 'dark' ? 'dark' : 'light'
  // Get current i18n language
  const language = i18n?.language ?? 'en'

  useEffect(() => {
    const win = window as any

    // Initialize Featurebase if it doesn't exist
    if (typeof win.Featurebase !== 'function') {
      win.Featurebase = function () {
        // eslint-disable-next-line prefer-rest-params
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments)
      }
    }

    // Initialize changelog widget with configuration
    // This will be queued if script hasn't loaded yet
    if (win.Featurebase != null) {
      win.Featurebase('init_changelog_widget', {
        organization: 'jesusfilmproject',
        popup: {
          enabled: true,
          usersName: userName ?? '',
          autoOpenForNewUpdates: true
        },
        theme: theme,
        locale: language
      })
    }
  }, [loaded, userName, theme, language])

  return (
    <>
      <Script
        src="https://do.featurebase.app/js/sdk.js"
        id="featurebase-sdk"
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
      />
    </>
  )
}
