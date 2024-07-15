import { ReactElement, ReactNode, useMemo } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import PlausibleProvider from 'next-plausible'

import { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { StepFields } from '../../../__generated__/StepFields'

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
      <JourneyProvider value={{ journey, variant }}>
        <ThemeProvider {...journeyTheme} rtl={rtl} locale={locale}>
          {children}
        </ThemeProvider>
      </JourneyProvider>
    </PlausibleProvider>
  )
}
