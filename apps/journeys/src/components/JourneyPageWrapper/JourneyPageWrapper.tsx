import PlausibleProvider from 'next-plausible'
import { ReactElement, ReactNode, useMemo } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyAiContextProvider } from '@core/journeys/ui/JourneyAiContextProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourneyAiContextGenerator } from '@core/journeys/ui/useJourneyAiContextGenerator'
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

  const treeBlocks = useMemo(
    () => (journey.blocks != null ? transformer(journey.blocks) : []),
    [journey.blocks]
  )
  const languageBcp47 = journey.language?.bcp47 ?? undefined
  const aiContextValue = useJourneyAiContextGenerator(
    journey.showAssistant === true ? treeBlocks : [],
    languageBcp47
  )

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
        <JourneyAiContextProvider value={aiContextValue}>
          <ThemeProvider
            {...journeyTheme}
            rtl={rtl}
            locale={locale}
            fontFamilies={fontFamilies}
          >
            {children}
          </ThemeProvider>
        </JourneyAiContextProvider>
      </JourneyProvider>
    </PlausibleProvider>
  )
}
