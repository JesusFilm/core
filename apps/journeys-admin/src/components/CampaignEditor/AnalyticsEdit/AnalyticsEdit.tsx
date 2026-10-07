import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, MouseEvent, ReactElement } from 'react'

import { CampaignAnalyticsPanel } from '@core/journeys/ui/Campaign'
import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { useCampaignAnalyticsBlockShowMapMutation } from '../../../libs/useCampaignAnalyticsBlockShowMapMutation'
import { useWorldMap } from '../../../libs/useWorldMap'
import { useCampaignEditor } from '../CampaignEditorProvider'

interface AnalyticsEditProps {
  /** The Analytics section this editor sits in. */
  block: Pick<CampaignBlock, 'id' | 'pageId'> & { showMap: boolean }
}

interface ShowMapParameters {
  showMap: boolean
}

/**
 * The Analytics section on the editor canvas: the same panel the public page
 * shows, under the "Show map" switch. Flipping the switch is one Command that
 * writes `showMap` through `campaignAnalyticsBlockUpdate`, shown at once;
 * undo writes the previous value back.
 */
export function AnalyticsEdit({ block }: AnalyticsEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const {
    campaign,
    currentRegion,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [updateShowMap] = useCampaignAnalyticsBlockShowMapMutation()
  const worldMap = useWorldMap(block.showMap)

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const blockPageKind = pageKindOf(block) ?? pageKind
    add<ShowMapParameters>({
      parameters: {
        execute: { showMap: event.target.checked },
        undo: { showMap: block.showMap }
      },
      execute({ showMap }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.id
        })
        void updateShowMap({
          variables: { id: block.id, input: { showMap } },
          optimisticResponse: {
            campaignAnalyticsBlockUpdate: {
              __typename: 'CampaignAnalyticsBlock',
              id: block.id,
              showMap
            }
          }
        })
      }
    })
  }

  return (
    <Stack
      spacing={2}
      data-testid="AnalyticsEdit"
      onClick={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
    >
      <FormControlLabel
        control={<Switch checked={block.showMap} onChange={handleChange} />}
        label={t('Show map')}
        sx={{ alignSelf: 'flex-start', color: 'var(--campaign-band-text)' }}
      />
      <CampaignAnalyticsPanel
        campaignId={campaign.id}
        regions={campaign.regions}
        fixedRegion={currentRegion}
        strings={campaign.strings}
        showMap={block.showMap}
        worldMap={worldMap}
        accentColor={campaign.theme.accentColor}
      />
    </Stack>
  )
}
