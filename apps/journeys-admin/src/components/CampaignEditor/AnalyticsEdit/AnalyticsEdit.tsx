import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import { CampaignAnalyticsPanel } from '@core/journeys/ui/Campaign'
import { useWorldMap } from '@core/journeys/ui/Campaign/CampaignAnalytics/WorldMap/useWorldMap'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../CampaignEditorProvider'

/** The viewer serves the atlas; the canvas, on another origin, fetches it across. */
const ATLAS_URL = `${
  process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'
}/countries-110m.json`

interface AnalyticsEditProps {
  /** The Analytics section this editor sits in. */
  block: Pick<CampaignBlock, 'id'> & {
    showMap: boolean
    accentColor?: string | null
  }
}

/**
 * The Analytics section on the editor canvas: the same panel the public page
 * shows, with the world map while the section's `showMap` is on. The switch
 * that turns the map on or off lives in the section's Settings.
 */
export function AnalyticsEdit({ block }: AnalyticsEditProps): ReactElement {
  const { campaign, currentRegion } = useCampaignEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const worldMap = useWorldMap(block.showMap, ATLAS_URL)

  return (
    <Box
      data-testid="AnalyticsEdit"
      sx={{ width: '100%' }}
      onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
    >
      <CampaignAnalyticsPanel
        campaignId={campaign.id}
        regions={campaign.regions}
        fixedRegion={currentRegion}
        strings={campaign.strings}
        showMap={block.showMap}
        worldMap={worldMap}
        accentColor={block.accentColor ?? campaign.theme.accentColor}
      />
      {worldMap.error != null && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('The map could not be loaded. Try again later.')}
        </Alert>
      )}
    </Box>
  )
}
