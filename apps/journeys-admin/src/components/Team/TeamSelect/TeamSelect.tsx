import { ReactElement } from 'react'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import Stack from '@mui/material/Stack'
import { sortBy } from 'lodash'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import { useTeam } from '../TeamProvider'

export function TeamSelect(): ReactElement {
  const { query, activeTeam, setActiveTeam } = useTeam()

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
          value={activeTeam?.id ?? ''}
          onChange={(event) =>
            setActiveTeam(
              query?.data?.teams.find(
                (team) => team.id === event.target.value
              ) ?? null
            )
          }
          autoWidth
          sx={{
            '> .MuiSelect-select': {
              whiteSpace: 'normal',
              wordWrap: 'break-word'
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
        </Select>
      </FormControl>
    </Stack>
  )
}
