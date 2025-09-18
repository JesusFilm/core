import { useMutation } from '@apollo/client'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import sortBy from 'lodash/sortBy'
import { useTranslation } from 'next-i18next'
import { ReactElement, useRef, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { NotificationPopover } from '../../NotificationPopover'
import { TeamAvatars } from '../TeamAvatars'

interface TeamSelectProps {
  onboarding?: boolean
}

export function TeamSelect({ onboarding }: TeamSelectProps): ReactElement {
  const { teams, activeTeam, setActiveTeam, teamsLoading } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')
  const anchorRef = useRef(null)
  const currentRef = anchorRef.current
  const [open, setOpen] = useState(onboarding ?? false)

  const [updateLastActiveTeamId, { client }] =
    useMutation<UpdateLastActiveTeamId>(UPDATE_LAST_ACTIVE_TEAM_ID)

  function handleChange(event: SelectChangeEvent): void {
    const team = teams.find((team) => team.id === event.target.value)
    setActiveTeam(team ?? null)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: team?.id ?? null
        }
      },
      onCompleted() {
        void client.refetchQueries({ include: ['GetAdminJourneys'] })
      }
    })
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ overflow: 'hidden', flexGrow: 0 }}
        ref={anchorRef}
        data-testid="TeamSelect"
      >
        <UsersProfiles2Icon sx={{ mr: 1, ml: '3px' }} />
        <FormControl variant="standard" sx={{ minWidth: 100 }}>
          <Select
            defaultValue={activeTeam?.id}
            disabled={teamsLoading}
            displayEmpty
            value={activeTeam?.id ?? ''}
            disableUnderline
            onChange={handleChange}
            renderValue={() => activeTeam?.title ?? t('Shared With Me')}
            autoWidth
            sx={{
              '> .MuiSelect-select': {
                backgroundColor: 'transparent',
                wordWrap: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mr: 1,
                '&:focus': {
                  backgroundColor: 'transparent'
                }
              },
              fontWeight: 600,
              '> .MuiSvgIcon-root': {
                transition: 'transform 0.2s ease-in-out'
              }
            }}
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left'
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left'
              }
            }}
            IconComponent={ChevronDownIcon}
          >
            {(teams != null ? sortBy(teams, 'title') : []).map((team) => (
              <MenuItem
                key={team.id}
                value={team.id}
                sx={{
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  whiteSpace: 'normal',
                  wordBreak: 'normal',
                  overflowWrap: 'anywhere',
                  gap: 4
                }}
              >
                {team.title}
                <TeamAvatars userTeams={team.userTeams} />
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              value=""
              sx={{
                display: 'block',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}
            >
              {t('Shared With Me')}
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <NotificationPopover
        title={t('More journeys here')}
        description={t(
          'Journeys are grouped by teams. You can switch between teams by using this dropdown.'
        )}
        open={open}
        handleClose={() => setOpen(false)}
        currentRef={currentRef}
        pointerPosition="3%"
      />
    </>
  )
}
