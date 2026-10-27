import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { FirstRunHint } from '../FirstRunHint'
import { OrphanPageBar } from '../OrphanPageBar'

/**
 * The floating slot at the top of the canvas area: the First-run Hint and,
 * when the rendered region is unlisted, the orphan page bar. It is not a bar
 * and takes no layout height: it floats over the canvas and only its
 * contents catch the pointer.
 */
export function CanvasBanner(): ReactElement {
  const { campaign, currentRegion } = useCampaignEditor()

  return (
    <Stack
      spacing={2}
      data-testid="CampaignCanvasBanner"
      sx={{
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        zIndex: 1,
        alignItems: 'center',
        pointerEvents: 'none'
      }}
    >
      <Box sx={{ pointerEvents: 'auto', maxWidth: 640 }}>
        <FirstRunHint campaignId={campaign.id} />
      </Box>
      {currentRegion != null && !currentRegion.listed && (
        <Stack
          component={Paper}
          elevation={4}
          direction="row"
          spacing={2}
          data-testid="CampaignOrphanBanner"
          sx={{ p: 2, pointerEvents: 'auto' }}
        >
          <OrphanPageBar region={currentRegion} />
        </Stack>
      )}
    </Stack>
  )
}
