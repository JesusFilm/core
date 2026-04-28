import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import Lock1Icon from '@core/shared/ui/icons/Lock1'
import LockOpen1Icon from '@core/shared/ui/icons/LockOpen1'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'
import { useJourneyUpdateMutation } from '../../../../../libs/useJourneyUpdateMutation'

interface RestrictEditingToggleProps {
  journey?: Journey
  /**
   * Current user's role on the team that owns this journey. When undefined or
   * not `manager`, the toggle is disabled with a helper that explains why.
   */
  teamRole?: UserTeamRole
  handleCloseMenu: () => void
}

/**
 * Manager-only switch that flips `Journey.restrictEditing`. When ON, the
 * backend ACL restricts edit access on the team-local template to the
 * journey owner (creator) and team managers. Plain team members and
 * journey editors retain read access only.
 *
 * The component renders nothing for non-team-local templates (global
 * templates are governed by the publisher rule instead).
 */
export function RestrictEditingToggle({
  journey,
  teamRole,
  handleCloseMenu
}: RestrictEditingToggleProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [journeyUpdate, { loading }] = useJourneyUpdateMutation()

  if (journey == null) return null

  const isLocalTemplate =
    journey.template === true && journey.team?.id !== 'jfp-team'
  if (!isLocalTemplate) return null

  const isManager = teamRole === UserTeamRole.manager
  const checked = journey.restrictEditing === true

  const handleToggle = async (): Promise<void> => {
    if (!isManager || loading) return
    const next = !checked
    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { restrictEditing: next }
        }
      })
      enqueueSnackbar(
        next
          ? t('Editing restricted to managers and creator')
          : t('Editing unlocked for the team'),
        { variant: 'success', preventDuplicate: true }
      )
      handleCloseMenu()
    } catch {
      enqueueSnackbar(t('Could not change template edit restriction'), {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <MenuItem
      onClick={handleToggle}
      disabled={!isManager || loading}
      data-testid="RestrictEditingToggle"
    >
      <ListItemIcon>
        {checked ? (
          <Lock1Icon color="secondary" />
        ) : (
          <LockOpen1Icon color="secondary" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={t('Restrict editing to managers')}
        secondary={
          isManager ? undefined : t('Only team managers can change this')
        }
      />
      <Switch
        edge="end"
        checked={checked}
        disabled={!isManager || loading}
        inputProps={{
          'aria-label': t('Restrict editing to managers'),
          // Prevent double-activation: MenuItem onClick already triggers
          // the toggle, so the Switch should not be a separate tab stop.
          tabIndex: -1
        }}
      />
    </MenuItem>
  )
}
