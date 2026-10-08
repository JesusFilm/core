import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next/pages'
import { KeyboardEvent, MouseEvent, ReactElement, useState } from 'react'

import { hasText } from '@core/journeys/ui/Campaign'
import LinkIcon from '@core/shared/ui/icons/Link'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import {
  CampaignButtonAction,
  CampaignButtonBlock
} from '../../../libs/useCampaignBlockActionMutation'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { useCampaignActionCommand } from '../utils/useCampaignActionCommand'

type LinkKind = 'link' | 'scroll' | 'region'
type Translate = (key: string) => string

function kindOf(action: CampaignButtonAction | null): LinkKind {
  switch (action?.__typename) {
    case 'CampaignScrollToBlockAction':
      return 'scroll'
    case 'CampaignNavigateToRegionAction':
      return 'region'
    default:
      return 'link'
  }
}

/** A section is listed by its title when it has one, else by its type. */
export function sectionLabel(t: Translate, block: CampaignBlock): string {
  if ('title' in block && hasText(block.title)) return block.title
  return blockLabel(t, block.__typename)
}

/** The top-level blocks of a page in order: the sections a button can scroll to. */
export function pageSections(
  blocks: CampaignBlock[],
  pageId: string | undefined
): CampaignBlock[] {
  if (pageId == null) return []
  return sortBy(
    blocks.filter(
      (block) =>
        block.pageId === pageId &&
        block.parentBlockId == null &&
        block.parentOrder != null
    ),
    'parentOrder'
  )
}

/** The https scheme is the only rule the editor checks before the API does. */
export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

interface ChipLabel {
  label: string
  /** The target no longer exists: a deleted region (`regionId` null) or section. */
  missing: boolean
}

/** What the chip reads for an action: the address, the section, the region, or what is missing. */
export function linkChipLabel(
  t: Translate,
  action: CampaignButtonAction | null,
  campaign: Pick<Campaign, 'blocks' | 'regions'>
): ChipLabel {
  switch (action?.__typename) {
    case 'CampaignLinkAction':
      return { label: action.url, missing: false }
    case 'CampaignScrollToBlockAction': {
      const target = campaign.blocks.find(
        (block) => block.id === action.blockId
      )
      if (target == null) return { label: t('Missing section'), missing: true }
      return { label: sectionLabel(t, target), missing: false }
    }
    case 'CampaignNavigateToRegionAction': {
      const region =
        action.regionId == null
          ? undefined
          : campaign.regions.find(
              (candidate) => candidate.id === action.regionId
            )
      if (region == null) return { label: t('Missing region'), missing: true }
      return { label: region.name, missing: false }
    }
    default:
      return { label: t('Add link'), missing: false }
  }
}

interface LinkChipProps {
  block: CampaignButtonBlock
}

/**
 * The link chip on a selected button's bar: reads the button's action and
 * opens a picker with the three kinds — a web address, a section on this
 * page (listed by title or type), a Campaign Region. Each pick is one Command;
 * "Remove link" is one too. The editor pre-validates the https scheme only
 * and shows the API's message verbatim when a write fails.
 */
export function LinkChip({ block }: LinkChipProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    state: { pageKind }
  } = useCampaignEditor()
  const { addAction } = useCampaignActionCommand()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [kind, setKind] = useState<LinkKind>('link')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string>()

  const action = block.action
  const { label, missing } = linkChipLabel(t, action, campaign)
  // A chrome button shows on every page; it scrolls within the page on the canvas.
  const pageId =
    block.pageId ?? campaign.pages.find((page) => page.kind === pageKind)?.id
  const sections = pageSections(campaign.blocks, pageId)
  const regions = sortBy(campaign.regions, 'order')

  function handleOpen(event: MouseEvent<HTMLElement>): void {
    setKind(kindOf(action))
    setUrl(action?.__typename === 'CampaignLinkAction' ? action.url : '')
    setError(undefined)
    setAnchor(event.currentTarget)
  }

  function handleClose(): void {
    setAnchor(null)
  }

  function commit(next: CampaignButtonAction | null): void {
    setError(undefined)
    addAction({ block, action: next, undoAction: action, onError: setError })
    handleClose()
  }

  function handleSaveLink(): void {
    const trimmed = url.trim()
    if (!isHttpsUrl(trimmed)) {
      setError(t('Enter an address starting with https://'))
      return
    }
    if (action?.__typename === 'CampaignLinkAction' && action.url === trimmed) {
      handleClose()
      return
    }
    commit({
      __typename: 'CampaignLinkAction',
      parentBlockId: block.id,
      url: trimmed,
      target: action?.__typename === 'CampaignLinkAction' ? action.target : null
    })
  }

  function handleUrlKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    handleSaveLink()
  }

  function handlePickSection(blockId: string): void {
    if (
      action?.__typename === 'CampaignScrollToBlockAction' &&
      action.blockId === blockId
    ) {
      handleClose()
      return
    }
    commit({
      __typename: 'CampaignScrollToBlockAction',
      parentBlockId: block.id,
      blockId
    })
  }

  function handlePickRegion(regionId: string): void {
    if (
      action?.__typename === 'CampaignNavigateToRegionAction' &&
      action.regionId === regionId
    ) {
      handleClose()
      return
    }
    commit({
      __typename: 'CampaignNavigateToRegionAction',
      parentBlockId: block.id,
      regionId
    })
  }

  function handleRemove(): void {
    commit(null)
  }

  return (
    <>
      <Chip
        icon={<LinkIcon />}
        label={label}
        variant="outlined"
        color={missing ? 'error' : 'default'}
        onClick={handleOpen}
        data-testid="LinkChip"
        sx={{ maxWidth: 260 }}
      />
      {error != null && anchor == null && (
        <Typography variant="caption" color="error" role="alert">
          {error}
        </Typography>
      )}
      <Popover
        open={anchor != null}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack spacing={2} sx={{ p: 2, width: 360 }} data-testid="LinkPicker">
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={kind}
            onChange={(_event, next: LinkKind | null) => {
              if (next != null) setKind(next)
            }}
            aria-label={t('Link kind')}
          >
            <ToggleButton value="link">{t('Web address')}</ToggleButton>
            <ToggleButton value="scroll">{t('Section')}</ToggleButton>
            <ToggleButton value="region">{t('Region')}</ToggleButton>
          </ToggleButtonGroup>
          {kind === 'link' && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'flex-start' }}
            >
              <TextField
                size="small"
                fullWidth
                autoFocus
                label={t('Web address')}
                placeholder="https://"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value)
                  setError(undefined)
                }}
                onKeyDown={handleUrlKeyDown}
                error={error != null}
                helperText={error}
                slotProps={{ formHelperText: { role: 'alert' } }}
              />
              <Button variant="contained" onClick={handleSaveLink}>
                {t('Save')}
              </Button>
            </Stack>
          )}
          {kind === 'scroll' &&
            (sections.length === 0 ? (
              <Typography variant="body2">
                {t('No sections on this page')}
              </Typography>
            ) : (
              <List dense disablePadding aria-label={t('Section')}>
                {sections.map((section) => (
                  <ListItemButton
                    key={section.id}
                    selected={
                      action?.__typename === 'CampaignScrollToBlockAction' &&
                      action.blockId === section.id
                    }
                    onClick={() => handlePickSection(section.id)}
                  >
                    <ListItemText primary={sectionLabel(t, section)} />
                  </ListItemButton>
                ))}
              </List>
            ))}
          {kind === 'region' &&
            (regions.length === 0 ? (
              <Typography variant="body2">{t('No regions yet')}</Typography>
            ) : (
              <List dense disablePadding aria-label={t('Region')}>
                {regions.map((region) => (
                  <ListItemButton
                    key={region.id}
                    selected={
                      action?.__typename === 'CampaignNavigateToRegionAction' &&
                      action.regionId === region.id
                    }
                    onClick={() => handlePickRegion(region.id)}
                  >
                    <ListItemText primary={region.name} />
                  </ListItemButton>
                ))}
              </List>
            ))}
          {action != null && (
            <Button
              color="error"
              startIcon={<Trash2Icon />}
              onClick={handleRemove}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('Remove link')}
            </Button>
          )}
        </Stack>
      </Popover>
    </>
  )
}
