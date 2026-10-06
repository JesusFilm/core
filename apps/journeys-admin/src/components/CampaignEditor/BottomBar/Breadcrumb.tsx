import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'

/** A block and everything above it, outermost first. */
function trailOf(
  blocks: CampaignBlock[],
  block: CampaignBlock | undefined
): CampaignBlock[] {
  const trail: CampaignBlock[] = []
  let current = block
  while (current != null && trail.length < blocks.length) {
    trail.unshift(current)
    const parentId: string | null = current.parentBlockId
    current = blocks.find((candidate) => candidate.id === parentId)
  }
  return trail
}

/**
 * Campaign › Section › Extra, and inside a Columns section Campaign ›
 * Columns › Column › Section › Extra. Each earlier crumb selects that level,
 * so the breadcrumb replaces back buttons; the last crumb is the selection
 * itself.
 */
export function Breadcrumb(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection, selectBlock } = useCampaignEditor()
  const crumbs: Array<{ label: string; blockId?: string }> = [
    { label: t('Campaign') },
    ...trailOf(campaign.blocks, selection.block).map((block) => ({
      label: blockLabel(t, block.__typename),
      blockId: block.id
    }))
  ]

  return (
    <Breadcrumbs
      aria-label={t('Selection')}
      data-testid="CampaignBreadcrumb"
      separator="›"
      sx={{ minWidth: 200 }}
    >
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1 ? (
          <Typography key={index} color="text.primary" aria-current="page">
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={index}
            component="button"
            type="button"
            underline="hover"
            color="inherit"
            onClick={() => selectBlock(crumb.blockId)}
          >
            {crumb.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  )
}
