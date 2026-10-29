import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { TFunction } from 'i18next'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next/pages'
import { KeyboardEvent, ReactElement, useEffect, useState } from 'react'

import { hasText } from '@core/journeys/ui/Campaign'
import {
  LINK_URL_MAX_LENGTH,
  urlLength
} from '@core/journeys/ui/Campaign/libs/translatedField'
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
import { pageSections } from '../sectionTypes'
import { isHttpsUrl } from '../utils/isHttpsUrl'
import { useCampaignActionCommand } from '../utils/useCampaignActionCommand'
import { useCommittedField } from '../utils/useCommittedField'

type LinkKind = 'link' | 'scroll' | 'region'
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
export function sectionLabel(t: TFunction, block: CampaignBlock): string {
  if ('title' in block && hasText(block.title)) return block.title
  return blockLabel(t, block.__typename)
}

interface LinkLabel {
  label: string
  /** The target no longer exists: a deleted region (`regionId` null) or section. */
  missing: boolean
}

/** What the link reads for an action: the address, the section, the region, or what is missing. */
export function linkLabel(
  t: TFunction,
  action: CampaignButtonAction | null,
  campaign: Pick<Campaign, 'blocks' | 'regions'>
): LinkLabel {
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
      return { label: t('No link'), missing: false }
  }
}

interface LinkSettingsProps {
  block: CampaignButtonBlock
}

/**
 * A button Extra's Link settings, inline in the Settings tab: the current
 * target, then the three kinds — a web address, a section on this page
 * (listed by title or type), a Campaign Region. Each pick is one Command;
 * "Remove link" is one too. The editor pre-validates the https scheme only
 * and shows the API's message verbatim when a write fails.
 */
export function LinkSettings({ block }: LinkSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    state: { pageKind }
  } = useCampaignEditor()
  const { addAction } = useCampaignActionCommand()
  const action = block.action
  const savedUrl = action?.__typename === 'CampaignLinkAction' ? action.url : ''
  const [pickedKind, setPickedKind] = useState<LinkKind>()
  const [error, setError] = useState<string>()
  const url = useCommittedField({
    committed: savedUrl,
    validate: (value) =>
      isHttpsUrl(value)
        ? undefined
        : t('Enter an address starting with https://'),
    save: handleSaveLink
  })

  useEffect(() => {
    setPickedKind(undefined)
  }, [action?.__typename, savedUrl])

  const kind = pickedKind ?? kindOf(action)
  const { label, missing } = linkLabel(t, action, campaign)
  // A chrome button shows on every page; it scrolls within the page on the canvas.
  const pageId =
    block.pageId ?? campaign.pages.find((page) => page.kind === pageKind)?.id
  const sections = pageSections(campaign.blocks, pageId)
  const regions = sortBy(campaign.regions, 'order')
  const urlError = url.error ?? error

  /** Write the action; a refusal keeps the kind and `typedUrl` the author was on. */
  function commit(
    next: CampaignButtonAction | null,
    typedUrl = url.value
  ): void {
    setError(undefined)
    addAction({
      block,
      action: next,
      undoAction: action,
      onError: (message) => {
        // The rollback puts the old action back, which would otherwise take
        // the kind picker, and what the author typed in it, with it.
        setPickedKind(kind)
        url.onChange(typedUrl)
        setError(message)
      }
    })
  }

  function handleSaveLink(trimmed: string): void {
    commit(
      {
        __typename: 'CampaignLinkAction',
        parentBlockId: block.id,
        url: trimmed,
        target:
          action?.__typename === 'CampaignLinkAction' ? action.target : null
      },
      trimmed
    )
  }

  function handleUrlKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') return
    event.preventDefault()
    url.onBlur()
  }

  function handlePickSection(blockId: string): void {
    if (
      action?.__typename === 'CampaignScrollToBlockAction' &&
      action.blockId === blockId
    )
      return
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
    )
      return
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
    <Stack spacing={2} data-testid="LinkSettings" data-block-id={block.id}>
      <Typography variant="subtitle2">{t('Link')}</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <LinkIcon fontSize="small" color={missing ? 'error' : 'inherit'} />
        <Typography
          variant="body2"
          color={missing ? 'error' : 'text.secondary'}
          data-testid="LinkCurrent"
          data-missing={missing}
          sx={{ overflowWrap: 'anywhere' }}
        >
          {label}
        </Typography>
      </Stack>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={kind}
        onChange={(_event, next: LinkKind | null) => {
          if (next == null) return
          setPickedKind(next)
          setError(undefined)
        }}
        aria-label={t('Link kind')}
      >
        <ToggleButton value="link">{t('Web address')}</ToggleButton>
        <ToggleButton value="scroll">{t('Section')}</ToggleButton>
        <ToggleButton value="region">{t('Region')}</ToggleButton>
      </ToggleButtonGroup>
      {kind === 'link' && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            size="small"
            fullWidth
            label={t('Web address')}
            placeholder="https://"
            value={url.value}
            onChange={(event) => {
              url.onChange(event.target.value)
              setError(undefined)
            }}
            onKeyDown={handleUrlKeyDown}
            error={urlError != null}
            helperText={
              urlError ?? `${urlLength(url.value)} / ${LINK_URL_MAX_LENGTH}`
            }
            slotProps={{
              formHelperText: urlError != null ? { role: 'alert' } : undefined
            }}
          />
          <Button variant="contained" onClick={url.onBlur}>
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
      {error != null && kind !== 'link' && (
        <Typography variant="caption" color="error" role="alert">
          {error}
        </Typography>
      )}
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
  )
}
