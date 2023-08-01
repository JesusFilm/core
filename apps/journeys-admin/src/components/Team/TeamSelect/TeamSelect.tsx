import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import Stack from '@mui/material/Stack'
import sortBy from 'lodash/sortBy'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'react-i18next'
import Divider from '@mui/material/Divider'
import { useTeam } from '../TeamProvider'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'

export const UPDATE_LAST_ACTIVE_TEAM_ID = gql`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

export function TeamSelect(): ReactElement {
  const { query, activeTeam, setActiveTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')

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
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ overflow: 'hidden', flexGrow: 1 }}
    >
      <PeopleOutlineRoundedIcon sx={{ mr: 3, ml: '3px' }} />
      <FormControl variant="standard" sx={{ minWidth: 100 }}>
        <Select
          disabled={query.loading}
          displayEmpty
          value={activeTeam?.id ?? ''}
          onChange={handleChange}
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
                display: 'block',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}
            >
              {team.title}
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
  )
}
