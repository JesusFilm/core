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

  const journeyDomain =
    journeyId != null ? `api-journeys-journey-${journeyId}` : ''
  const teamDomain = teamId != null ? `,api-journeys-team-${teamId}` : ''
  const templateDomain = journey?.template
    ? `,api-journeys-template-${journeyId}`
    : journey?.fromTemplateId != null
      ? `,api-journeys-template-${journey.fromTemplateId}`
      : ''

  return (
    <PlausibleProvider
      enabled
      trackLocalhost
      trackFileDownloads
      trackOutboundLinks
      manualPageviews
      customDomain="/plausible"
      domain={`${journeyDomain}${teamDomain}${templateDomain}`}
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
