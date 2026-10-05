import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'

/**
 * Campaign › Section › Extra. Each earlier crumb selects that level, so the
 * breadcrumb replaces back buttons; the last crumb is the selection itself.
 */
export function Breadcrumb(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { selection, selectBlock, selectRegion } = useCampaignEditor()
  const crumbs: Array<{ label: string; onClick?: () => void }> = [
    { label: t('Campaign') }
  ]
  if (selection.host != null) {
    const hostId = selection.host.id
    crumbs.push({
      label: blockLabel(t, selection.host.__typename),
      onClick: () => selectBlock(hostId)
    })
  }
  // A region card sits in its switcher; a Region Line sits in its region.
  if (selection.region != null) {
    const regionId = selection.region.id
    const hostId = selection.host?.id
    crumbs.push({
      label: selection.region.name,
      onClick: () => selectRegion(regionId, hostId)
    })
  }
  if (selection.block != null && selection.block.id !== selection.host?.id) {
    const blockId = selection.block.id
    crumbs.push({
      label: blockLabel(t, selection.block.__typename),
      onClick: () => selectBlock(blockId)
    })
  }

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
            onClick={crumb.onClick ?? (() => selectBlock(undefined))}
          >
            {crumb.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  )
}
