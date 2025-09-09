import PlausibleProvider from 'next-plausible'
import { ReactElement, ReactNode } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

interface JourneyPageWrapperProps {
  journey: Journey
  variant?: 'default' | 'admin' | 'embed'
  theme?: { themeMode: ThemeMode; themeName: ThemeName }
  locale: string
  rtl: boolean
  children: ReactNode
}

export function JourneyPageWrapper({
  journey,
  variant,
  theme,
  rtl,
  locale,
  children
}: JourneyPageWrapperProps): ReactElement {
  const journeyId = journey?.id
  const teamId = journey?.team?.id
  const journeyTheme = theme ?? {
    themeName: journey.themeName,
    themeMode: journey.themeMode
  }

  const fontFamilies = {
    headerFont: journey.journeyTheme?.headerFont ?? '',
    bodyFont: journey.journeyTheme?.bodyFont ?? '',
    labelFont: journey.journeyTheme?.labelFont ?? ''
  }

  return (
    <PlausibleProvider
      enabled
      trackLocalhost
      trackFileDownloads
      trackOutboundLinks
      manualPageviews
      customDomain="/plausible"
      domain={`api-journeys-journey-${journeyId ?? ''}${
        teamId != null ? `,api-journeys-team-${teamId}` : ''
      }`}
    >
      <JourneyProvider value={{ journey, variant: variant ?? 'default' }}>
        <ThemeProvider
          {...journeyTheme}
          rtl={rtl}
          locale={locale}
          fontFamilies={fontFamilies}
        >
          {children}
        </ThemeProvider>
      </JourneyProvider>
    </PlausibleProvider>
  )
}
