import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { HowToCreateSection } from './HowToCreateSection'
import { SharingAndPublishingSection } from './SharingAndPublishingSection'
import { TemplateInfoAccordion } from './TemplateInfoAccordion'
import { TemplateTypesSection } from './TemplateTypesSection'
import { TrackingAndAnalyticsSection } from './TrackingAndAnalyticsSection'

/**
 * Stable IDs for each accordion section. Used for `aria-controls` wiring,
 * single-expand state, and `defaultExpanded` prop selection. The order of the
 * union here matches the order the panel renders in `TemplateInfoPanel`.
 */
export type TemplateInfoSectionId =
  | 'templateTypes'
  | 'howToCreate'
  | 'trackingAndAnalytics'
  | 'sharingAndPublishing'

export interface TemplateInfoPanelProps {
  /**
   * Optional starting section. When omitted, all accordions render collapsed
   * on first mount (matches Figma `39653-66422`).
   */
  defaultExpanded?: TemplateInfoSectionId
  className?: string
}

/**
 * TemplateInfoPanel — the static educational side panel that lives next to
 * the local template grid on the Team Templates tab (NES-1538). The component
 * is purely presentational: it reads no Apollo, no `JourneyProvider`, no
 * `useEditor`. NES-1642 will reuse it as-is for the editor floating helper.
 *
 * Visuals are driven by Figma frame `39653-66422` (chrome) and its
 * expanded-state siblings (`39657-66822`, `39653-66495`, `39657-66677`,
 * `39657-66751`). Section 5 (Embedding Canva or Google Slides) has no Figma —
 * its copy comes from Siyang's 2026-05-11 ticket comment.
 *
 * Accordions are single-expand: opening any section collapses the previously
 * expanded one. Clicking an already-open section closes it. The single source
 * of truth lives in this component's `expanded` state so the section
 * components stay stateless and reusable.
 */
export function TemplateInfoPanel({
  defaultExpanded,
  className
}: TemplateInfoPanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [expanded, setExpanded] = useState<TemplateInfoSectionId | null>(
    defaultExpanded ?? null
  )

  function makeHandleChange(id: TemplateInfoSectionId) {
    return (nextExpanded: boolean): void => {
      setExpanded(nextExpanded ? id : null)
    }
  }

  return (
    <Box
      className={className}
      data-testid="TemplateInfoPanel"
      sx={{
        width: { xs: '100%', md: 375 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4,
        overflow: 'hidden'
      }}
    >
      <Stack
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2.5,
          gap: 1,
          color: 'text.primary'
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            fontSize: 22,
            lineHeight: '27px'
          }}
        >
          {t('What templates are about:')}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: '24px'
          }}
        >
          {t(
            'You can share projects created on our platform with others. This allows you to track the performance of every project generated from your template.'
          )}
        </Typography>
      </Stack>
      <Divider />
      <Box>
        <TemplateInfoAccordion
          id="templateTypes"
          title={t('Template Types')}
          expanded={expanded === 'templateTypes'}
          onChange={makeHandleChange('templateTypes')}
        >
          <TemplateTypesSection />
        </TemplateInfoAccordion>
        <TemplateInfoAccordion
          id="howToCreate"
          title={t('How to create')}
          expanded={expanded === 'howToCreate'}
          onChange={makeHandleChange('howToCreate')}
        >
          <HowToCreateSection />
        </TemplateInfoAccordion>
        <TemplateInfoAccordion
          id="trackingAndAnalytics"
          title={t('Tracking and Analytics')}
          expanded={expanded === 'trackingAndAnalytics'}
          onChange={makeHandleChange('trackingAndAnalytics')}
        >
          <TrackingAndAnalyticsSection />
        </TemplateInfoAccordion>
        <TemplateInfoAccordion
          id="sharingAndPublishing"
          title={t('Sharing and Publishing')}
          expanded={expanded === 'sharingAndPublishing'}
          onChange={makeHandleChange('sharingAndPublishing')}
          isLast
        >
          <SharingAndPublishingSection />
        </TemplateInfoAccordion>
      </Box>
    </Box>
  )
}
