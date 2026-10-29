import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useState } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'
import { LeftPanelBody } from '../LeftPanel'
import { blockIcon } from '../utils/blockIcon'
import { blockLabel } from '../utils/blockLabel'
import { useCampaignAddCommand } from '../utils/useCampaignAddCommand'

interface AddGroupProps {
  title: string
  hint?: string
  /** Shown between the title and the list of types. */
  control?: ReactNode
  children?: ReactNode
}

function AddGroup({
  title,
  hint,
  control,
  children
}: AddGroupProps): ReactElement {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" color="text.secondary" component="h3">
        {title}
      </Typography>
      {hint != null && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
      {control}
      {children != null && (
        <List disablePadding aria-label={title}>
          {children}
        </List>
      )}
    </Stack>
  )
}

interface AddItemProps {
  label: string
  icon: ReactElement
  onClick: () => void
}

function AddItem({ label, icon, onClick }: AddItemProps): ReactElement {
  return (
    <ListItemButton onClick={onClick} aria-label={label}>
      <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}

/**
 * The Add panel: the section, Extra and Region Line types that can be added,
 * in three groups. Clicking a type adds it in place relative to the selection
 * (see `addTargets`); a group with nowhere to add to says why instead of
 * listing disabled types. Every add is the same create Command a menu used to
 * dispatch.
 */
export function AddPanel(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { targets, addSection, addExtra, addLine } = useCampaignAddCommand()
  const [placement, setPlacement] = useState<CampaignChildPlacement>(
    CampaignChildPlacement.below
  )

  function handlePlacementChange(
    _event: unknown,
    next: CampaignChildPlacement | null
  ): void {
    if (next != null) setPlacement(next)
  }

  return (
    <LeftPanelBody spacing={3} data-testid="CampaignAddPanel">
      <Typography variant="h6" noWrap>
        {t('Add')}
      </Typography>
      <AddGroup
        title={t('Sections')}
        hint={
          targets.section == null
            ? t('Select an empty column, or a section not in a column.')
            : undefined
        }
      >
        {targets.section?.typenames.map((typename) => (
          <AddItem
            key={typename}
            label={blockLabel(t, typename)}
            icon={blockIcon(typename)}
            onClick={() => addSection(typename)}
          />
        ))}
      </AddGroup>
      <AddGroup
        title={t('Extras')}
        control={
          targets.extra != null && !targets.extra.inheritsPlacement ? (
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={placement}
              onChange={handlePlacementChange}
              aria-label={t('Placement')}
            >
              <ToggleButton value={CampaignChildPlacement.above}>
                {t('Above text')}
              </ToggleButton>
              <ToggleButton value={CampaignChildPlacement.below}>
                {t('Below text')}
              </ToggleButton>
            </ToggleButtonGroup>
          ) : undefined
        }
        hint={
          targets.extra == null
            ? t('Select a section to add text or a button to it.')
            : undefined
        }
      >
        {targets.extra == null
          ? undefined
          : targets.extra.typenames.map((typename) => (
              <AddItem
                key={typename}
                label={blockLabel(t, typename)}
                icon={blockIcon(typename)}
                onClick={() => addExtra(typename, placement)}
              />
            ))}
      </AddGroup>
      {targets.line != null && (
        <AddGroup title={t('Region')}>
          <AddItem
            label={t('Add line')}
            icon={<Plus2Icon />}
            onClick={addLine}
          />
        </AddGroup>
      )}
    </LeftPanelBody>
  )
}
