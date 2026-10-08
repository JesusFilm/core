import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import { CampaignRegionCountries } from '@core/journeys/ui/Campaign'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../__generated__/GetCampaign'
import { TypographyVariant } from '../../../../__generated__/globalTypes'
import {
  regionLines,
  sortedRegions,
  useCampaignEditor
} from '../CampaignEditorProvider'
import { InlineText } from '../Canvas/InlineText'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

const SELECTED_OUTLINE = {
  outline: `2px solid ${adminPrimary.main}`,
  outlineOffset: -2
}

interface RegionSwitcherEditProps {
  /** The switcher section this editor sits in. */
  block: Pick<CampaignBlock, 'id'>
}

interface RegionCardEditProps {
  region: CampaignRegion
  hostBlockId: string
}

/**
 * One region card on the canvas: the name, its Region Lines as inline text
 * and its country chips. Clicking the card selects the region; clicking a
 * line selects that line, which then edits in place as any typography.
 */
function RegionCardEdit({
  region,
  hostBlockId
}: RegionCardEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection, selectBlock, selectRegion } = useCampaignEditor()
  const selected =
    selection.kind === 'region' && selection.region?.id === region.id
  const lines = regionLines(campaign.blocks, region.id)

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    selectRegion(region.id, hostBlockId)
  }

  return (
    <Box
      data-testid={`RegionCardEdit-${region.id}`}
      data-selected={selected}
      onClick={handleClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.5,
        p: 3,
        borderRadius: 1,
        cursor: 'pointer',
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)',
        ...(selected ? SELECTED_OUTLINE : {})
      }}
    >
      <Typography
        variant="h5"
        component="span"
        data-testid="RegionCardName"
        sx={{ color: 'var(--campaign-band-heading)' }}
      >
        {region.name}
      </Typography>
      {lines.map((line) =>
        line.__typename === 'CampaignTypographyBlock' ? (
          <Box
            key={line.id}
            data-testid={`RegionLineEdit-${line.id}`}
            onClick={(event: MouseEvent<HTMLElement>) => {
              event.stopPropagation()
              selectBlock(line.id)
            }}
            sx={{
              width: '100%',
              ...(selection.block?.id === line.id ? SELECTED_OUTLINE : {})
            }}
          >
            <InlineText
              target={{ block: line, field: 'content' }}
              placeholder={t('Your text')}
              editing={selection.block?.id === line.id}
              autoFocus={selection.block?.id === line.id}
              onSelect={() => selectBlock(line.id)}
              variant={line.typographyVariant ?? TypographyVariant.body1}
              variantMapping={{ overline: 'p', caption: 'p' }}
              align={line.align ?? undefined}
              sx={{ color: line.color ?? 'var(--campaign-band-text)' }}
            />
          </Box>
        ) : null
      )}
      <CampaignRegionCountries region={region} />
    </Box>
  )
}

/**
 * The Region Switcher on the editor canvas: every listed region as a card
 * (the current region hidden on its own Region Page) and the "+ Add" that
 * runs `campaignRegionCreate` as a Command. With no listed region the
 * section reads "Add your first region".
 */
export function RegionSwitcherEdit({
  block
}: RegionSwitcherEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, currentRegion } = useCampaignEditor()
  const { addRegion } = useCampaignRegionCommand()
  const regions = sortedRegions(campaign.regions).filter(
    (region) => region.listed && region.id !== currentRegion?.id
  )

  function handleAdd(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    addRegion({ hostBlockId: block.id })
  }

  const addButton = (
    <Button
      variant="outlined"
      color="inherit"
      startIcon={<Plus2Icon />}
      onClick={handleAdd}
      data-testid="RegionSwitcherAdd"
      sx={{ alignSelf: 'flex-start' }}
    >
      {t('Add')}
    </Button>
  )

  if (regions.length === 0)
    return (
      <Stack
        spacing={2}
        data-testid="RegionSwitcherEmpty"
        sx={{ alignItems: 'flex-start' }}
      >
        <Typography sx={{ color: 'var(--campaign-band-muted)' }}>
          {t('Add your first region')}
        </Typography>
        {addButton}
      </Stack>
    )

  return (
    <Stack spacing={2} data-testid="RegionSwitcherEdit">
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(auto-fill, minmax(230px, 1fr))'
          }
        }}
      >
        {regions.map((region) => (
          <RegionCardEdit
            key={region.id}
            region={region}
            hostBlockId={block.id}
          />
        ))}
      </Box>
      {addButton}
    </Stack>
  )
}
