import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import sortBy from 'lodash/sortBy'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

interface FormValues {
  teamSelect: string
}

export function JourneyCustomizeTeamSelect(): ReactElement {
  const { values, handleChange } = useFormikContext<FormValues>()
  const { query, setActiveTeam } = useTeam()
  const teams = query?.data?.teams ?? []

  return (
    <FormControl>
      <Select
        variant="filled"
        name="teamSelect"
        value={values.teamSelect}
        onChange={(e) => {
          handleChange(e)
          const selected = teams.find(
            (t) => t.id === (e.target as HTMLInputElement).value
          )
          setActiveTeam(selected ?? null)
        }}
        displayEmpty
        inputProps={{ 'aria-label': 'Team', sx: { py: 4 } }}
        renderValue={(selected) => {
          const team = teams.find((t) => t.id === selected)
          const label = team?.title ?? team?.publicTitle ?? ''
          return (
            <Typography
              variant="body1"
              noWrap
              sx={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {label}
            </Typography>
          )
        }}
      >
        {sortBy(teams, 'title').map((team) => (
          <MenuItem
            key={team.id}
            value={team.id}
            sx={{
              display: 'block',
              whiteSpace: 'normal',
              wordWrap: 'break-word'
            }}
          >
            {team.title ?? team.publicTitle}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
