import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { useCampaignAnalyticsBlockShowMapMutation } from '../../../libs/useCampaignAnalyticsBlockShowMapMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'

interface AnalyticsSettingsProps {
  /** The Analytics section this editor edits. */
  block: Pick<CampaignBlock, 'id' | 'pageId'> & { showMap: boolean }
}

interface ShowMapParameters {
  showMap: boolean
}

/**
 * The Analytics section's Settings: the "Show map" switch. Flipping it is one
 * Command that writes `showMap` through `campaignAnalyticsBlockUpdate`, shown
 * at once on the canvas; undo writes the previous value back.
 */
export function AnalyticsSettings({
  block
}: AnalyticsSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const {
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [updateShowMap] = useCampaignAnalyticsBlockShowMapMutation()

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
    <Stack spacing={2} data-testid="AnalyticsSettings" data-block-id={block.id}>
      <Typography variant="subtitle2">{t('Map')}</Typography>
      <FormControlLabel
        control={<Switch checked={block.showMap} onChange={handleChange} />}
        label={t('Show map')}
        sx={{ alignSelf: 'flex-start' }}
      />
    </Stack>
  )
}
