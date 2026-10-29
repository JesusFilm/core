import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useCallback } from 'react'

import {
  CampaignRegionCountries,
  CampaignRegionLines,
  regionFrameSx,
  regionNameVariant,
  switcherLayoutSx
} from '@core/journeys/ui/Campaign'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../__generated__/GetCampaign'
import {
  CampaignSwitcherVariant,
  TypographyVariant
} from '../../../../__generated__/globalTypes'
import { regionCardLabel, regionLineLabel } from '../blockLabel'
import {
  regionLines,
  regionNeedsJourney,
  sortedRegions,
  useCampaignEditor
} from '../CampaignEditorProvider'
import { CanvasDragHandle } from '../Canvas/CanvasDragHandle'
import { EditorNote } from '../Canvas/EditorNote'
import {
  ADMIN_PRIMARY,
  HOVER_OUTLINE_SX,
  SELECTED_OUTLINE
} from '../Canvas/hoverOutline'
import { InlineText } from '../Canvas/InlineText'
import { SelectionBadge } from '../Canvas/SelectionBadge'
import { regionDisplayName } from '../utils/regionDisplayName'
import { regionLineColor } from '../utils/regionLineColor'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'

interface RegionSwitcherEditProps {
  /** The switcher section this editor sits in. */
  block: Pick<CampaignBlock, 'id'> & {
    switcherVariant?: CampaignSwitcherVariant | null
  }
}

interface RegionCardEditProps {
  region: CampaignRegion
  hostBlockId: string
  variant: CampaignSwitcherVariant
}

/**
 * One region card on the canvas: the name (with a "Needs journey" badge
 * while any of its Share Languages is unlinked), its Region Lines as inline
 * text and its country chips. Clicking the card selects the region; clicking
 * a line selects that line, which then edits in place as any typography.
 * The handle on its right edge drags the card onto another card to
 * take that card's place in the region order, one Command through the
 * canvas's drag context.
 */
function RegionCardEdit({
  region,
  hostBlockId,
  variant
}: RegionCardEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    state: { previewLanguageId },
    selection,
    selectBlock,
    selectRegion
  } = useCampaignEditor()
  const selected =
    selection.kind === 'region' && selection.region?.id === region.id
  const lines = regionLines(campaign.blocks, region.id)
  const lineSelected = lines.some((line) => line.id === selection.block?.id)
  const muted = !region.listed && !selected && !lineSelected
  const dragId = `region:${region.id}`
  const dragData = { regionId: region.id }
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: dragId,
    data: dragData
  })
  const {
    setNodeRef: setDraggableRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    isDragging
  } = useDraggable({ id: dragId, data: dragData })
  const setCardRef = useCallback(
    (node: HTMLElement | null) => {
      setDroppableRef(node)
      setDraggableRef(node)
    },
    [setDroppableRef, setDraggableRef]
  )

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    selectRegion(region.id, hostBlockId)
  }

  return (
    <Box
      ref={setCardRef}
      id={`${hostBlockId}__${region.id}`}
      data-testid={`RegionCardEdit-${region.id}`}
      data-selected={selected}
      data-unlisted={!region.listed}
      data-drop-target={isOver || undefined}
      data-hoverable
      onClick={handleClick}
      sx={[
        regionFrameSx(variant),
        {
          position: 'relative',
          cursor: 'pointer',
          ...HOVER_OUTLINE_SX,
          ...(muted ? { opacity: 0.5 } : {}),
          ...(selected ? SELECTED_OUTLINE : {}),
          ...(isDragging ? { opacity: 0.6 } : {}),
          ...(isOver && !isDragging
            ? { outline: `2px dashed ${ADMIN_PRIMARY.main}`, outlineOffset: -2 }
            : {})
        }
      ]}
    >
      <SelectionBadge
        id={`${hostBlockId}__${region.id}`}
        label={regionCardLabel(t)}
        selected={selected}
        borderWidth={1}
      />
      <CanvasDragHandle
        activatorRef={setActivatorNodeRef}
        listeners={listeners}
        attributes={attributes}
        label={t('Drag region')}
        testId={`RegionCardDragHandle-${region.id}`}
        dragging={isDragging}
        visible={selected}
        position={{ top: '50%', right: 4, transform: 'translateY(-50%)' }}
        stopClick
      />
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Typography
          variant={regionNameVariant(variant)}
          component="span"
          data-testid="RegionCardName"
          sx={{ color: 'var(--campaign-band-heading)' }}
        >
          {regionDisplayName(
            region,
            previewLanguageId,
            campaign.defaultLanguageId
          )}
        </Typography>
        {!region.listed && (
          <EyeClosedIcon
            fontSize="small"
            titleAccess={t('Not listed')}
            data-testid="RegionUnlisted"
            sx={{ color: 'var(--campaign-band-muted)' }}
          />
        )}
        {regionNeedsJourney(region) && (
          <Chip
            size="small"
            color="warning"
            label={t('Needs journey')}
            data-testid="RegionNeedsJourney"
          />
        )}
      </Stack>
      <CampaignRegionLines variant={variant} showInPill>
        {lines.map((line) => {
          if (line.__typename !== 'CampaignTypographyBlock') return null
          const lineVariant = line.typographyVariant ?? TypographyVariant.body1
          return (
            <Box
              key={line.id}
              id={line.id}
              data-testid={`RegionLineEdit-${line.id}`}
              data-selected={selection.block?.id === line.id}
              data-hoverable
              onClick={(event: MouseEvent<HTMLElement>) => {
                event.stopPropagation()
                selectBlock(line.id)
              }}
              sx={{
                position: 'relative',
                width: '100%',
                // Room for the line's badge above it, clear of the text before it.
                mt: 1,
                ...HOVER_OUTLINE_SX,
                ...(selection.block?.id === line.id ? SELECTED_OUTLINE : {})
              }}
            >
              <SelectionBadge
                id={line.id}
                label={regionLineLabel(t)}
                selected={selection.block?.id === line.id}
              />
              <InlineText
                target={{ block: line, field: 'content' }}
                placeholder={t('Your text')}
                editing={selection.block?.id === line.id}
                autoFocus={selection.block?.id === line.id}
                onSelect={() => selectBlock(line.id)}
                variant={lineVariant}
                variantMapping={{ overline: 'p', caption: 'p' }}
                align={line.align ?? undefined}
                sx={{ color: regionLineColor(line.color, lineVariant) }}
              />
            </Box>
          )
        })}
      </CampaignRegionLines>
      <CampaignRegionCountries region={region} />
    </Box>
  )
}

/**
 * The Region Switcher on the editor canvas: every region as a card (the
 * current region hidden on its own Region Page), an unlisted one muted with an
 * eye-slash (until it or one of its lines is selected, so the selection
 * outline and the line being edited stay at full strength) so its Navigator
 * row can hover and select it, and the "+ Add"
 * that runs `campaignRegionCreate` as a Command. With no region to show the
 * section reads "Add your first region".
 */
export function RegionSwitcherEdit({
  block
}: RegionSwitcherEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, currentRegion } = useCampaignEditor()
  const variant = block.switcherVariant ?? CampaignSwitcherVariant.cards
  const { addRegion } = useCampaignRegionCommand()
  const regions = sortedRegions(campaign.regions).filter(
    (region) => region.id !== currentRegion?.id
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
        <EditorNote>{t('Add your first region')}</EditorNote>
        {addButton}
      </Stack>
    )

  return (
    <Stack spacing={2} data-testid="RegionSwitcherEdit" sx={{ width: '100%' }}>
      <Box
        data-testid="RegionSwitcherEditGrid"
        data-variant={variant}
        sx={switcherLayoutSx(variant)}
      >
        {regions.map((region) => (
          <RegionCardEdit
            key={region.id}
            region={region}
            hostBlockId={block.id}
            variant={variant}
          />
        ))}
      </Box>
      {addButton}
    </Stack>
  )
}
