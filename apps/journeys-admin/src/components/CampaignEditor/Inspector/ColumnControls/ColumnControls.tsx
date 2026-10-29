import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import Layout1Icon from '@core/shared/ui/icons/Layout1'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { CampaignSectionTypename } from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { blockLabel } from '../../utils/blockLabel'
import {
  columnSlots,
  sectionTypesForSlot,
  slotSection
} from '../../utils/sectionTypes'
import { useAddSection } from '../../utils/useAddSection'
import { useChangeTypeCommand } from '../../utils/useChangeTypeCommand'
import { useColumnSwapCommand } from '../../utils/useColumnSwapCommand'

/** The ⇄ glyph of the column swap control; a symbol, not copy to translate. */
const SWAP_GLYPH = '⇄'

/**
 * A Column Slot's settings: choose the type of an empty slot, change the
 * type of the section in it, and swap the Columns section's two slots. Shown
 * for a selected slot and for the section in one. Each is the Command it
 * was before the Inspector.
 */
export function ColumnControls(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    state: { pageKind },
    pageKindOf
  } = useCampaignEditor()
  const addSection = useAddSection()
  const { addChangeType } = useChangeTypeCommand()
  const { addColumnSwap } = useColumnSwapCommand()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const slot =
    selection.kind === 'slot'
      ? selection.block
      : selection.kind === 'column'
        ? campaign.blocks.find(
            (candidate) => candidate.id === selection.block?.parentBlockId
          )
        : undefined
  if (slot == null) return null

  const slotIsEmpty = slotSection(campaign.blocks, slot.id) == null
  const slotCount =
    slot.parentBlockId != null
      ? columnSlots(campaign.blocks, slot.parentBlockId).length
      : 0
  const changing = selection.kind === 'column'
  const slotPageKind =
    pageKindOf(selection.block ?? { pageId: slot.pageId }) ?? pageKind

  function handlePick(typename: CampaignSectionTypename): void {
    setMenuAnchor(null)
    if (slot?.pageId == null) return
    if (changing) {
      if (selection.block != null) addChangeType(selection.block, typename)
      return
    }
    addSection(typename, {
      pageId: slot.pageId,
      parentBlockId: slot.id,
      parentOrder: 0
    })
  }

  function handleSwap(): void {
    if (slot == null) return
    addColumnSwap(slot, selection.block?.id)
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      data-testid="InspectorColumnControls"
      sx={{ flexWrap: 'wrap', gap: 2 }}
    >
      {(slotIsEmpty || changing) && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={changing ? <Layout1Icon /> : <Plus2Icon />}
          onClick={(event: MouseEvent<HTMLButtonElement>) =>
            setMenuAnchor(event.currentTarget)
          }
        >
          {changing ? t('Change type') : t('Choose type')}
        </Button>
      )}
      <Button
        variant="outlined"
        color="secondary"
        aria-label={t('Swap columns')}
        disabled={slotCount < 2}
        onClick={handleSwap}
      >
        {SWAP_GLYPH}
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor != null}
        onClose={() => setMenuAnchor(null)}
        data-testid={
          changing ? 'CampaignChangeTypeMenu' : 'CampaignSectionTypeMenu'
        }
      >
        {sectionTypesForSlot(slotPageKind)
          .filter((typename) => typename !== selection.block?.__typename)
          .map((typename) => (
            <MenuItem key={typename} onClick={() => handlePick(typename)}>
              {blockLabel(t, typename)}
            </MenuItem>
          ))}
      </Menu>
    </Stack>
  )
}
