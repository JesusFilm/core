import { ReactElement, useRef, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import Stack from '@mui/material/Stack'
import sortBy from 'lodash/sortBy'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { useTeam } from '../TeamProvider'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { TeamAvatars } from '../TeamAvatars'

export const UPDATE_LAST_ACTIVE_TEAM_ID = gql`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

interface TeamSelectProps {
  onboarding?: boolean
}
export function TeamSelect({ onboarding }: TeamSelectProps): ReactElement {
  const { query, activeTeam, setActiveTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')
  const anchorRef = useRef(null)
  const [open, setOpen] = useState(onboarding ?? false)

  const [updateLastActiveTeamId] = useMutation<UpdateLastActiveTeamId>(
    UPDATE_LAST_ACTIVE_TEAM_ID
  )

  function handleChange(event: SelectChangeEvent): void {
    const team = query?.data?.teams.find(
      (team) => team.id === event.target.value
    )
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: team?.id ?? null
        }
      }
    })
    setActiveTeam(team ?? null)
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ overflow: 'hidden', flexGrow: 1 }}
        ref={anchorRef}
      >
        <PeopleOutlineRoundedIcon sx={{ mr: 3, ml: '3px' }} />
        <FormControl variant="standard" sx={{ minWidth: 100 }}>
          <Select
            defaultValue={activeTeam?.id}
            disabled={query.loading}
            displayEmpty
            value={activeTeam?.id ?? ''}
            onChange={handleChange}
            renderValue={() => activeTeam?.title ?? 'Shared With Me'}
            autoWidth
            sx={{
              '> .MuiSelect-select': {
                whiteSpace: 'normal',
                wordWrap: 'break-word'
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
          >
            {(query?.data?.teams != null
              ? sortBy(query.data?.teams, 'title')
              : []
            ).map((team) => (
              <MenuItem
                key={team.id}
                value={team.id}
                sx={{
                  minWidth: '300px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }}
              >
                <Typography sx={{ maxWidth: '77%' }}>{team.title}</Typography>
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
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 35,
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            maxWidth: { xs: 'calc(100% - 30px)', sm: 300 },
            mt: 4,
            position: 'relative',
            overflow: 'visible',
            '&::before': {
              backgroundColor: 'white',
              content: '""',
              display: 'block',
              position: 'absolute',
              width: 12,
              height: 12,
              top: -6,
              transform: 'rotate(45deg)',
              left: { xs: 20, sm: 10 },
              zIndex: 1
            }
          }
        }}
      >
        <Stack spacing={2} p={4}>
          <Typography variant="h6" gutterBottom>
            {t('More journeys here')}
          </Typography>
          <Typography>
            {t(
              'Journeys are grouped by teams. You can switch between teams by using this dropdown.'
            )}
          </Typography>
          <Box textAlign="right">
            <Button onClick={() => setOpen(false)}>{t('Dismiss')}</Button>
          </Box>
        </Stack>
      </Popover>
    </>
  )
}
