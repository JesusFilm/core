import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import Script from 'next/script'
import { ReactElement, useEffect } from 'react'

interface FeedbackInitProps {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
  userEmail?: string
  userName?: string
}

export function FeedbackInit({
  loaded,
  setLoaded,
  userEmail,
  userName
}: FeedbackInitProps): ReactElement {
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

    // Initialize feedback widget with configuration
    // This will be queued if script hasn't loaded yet
    if (win.Featurebase != null) {
      win.Featurebase('initialize_feedback_widget', {
        organization: 'jesusfilmproject',
        theme: theme,
        placement: 'right', // optional - remove to hide the floating button
        email: userEmail ?? undefined,
        locale: language,
        metadata: null // Attach session-specific metadata to feedback
      })
    }
  }, [loaded, userEmail, theme, language])

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
