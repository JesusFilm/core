import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import sortBy from 'lodash/sortBy'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import UsersProfiles2 from '@core/shared/ui/icons/UsersProfiles2'

interface FormValues {
  teamSelect: string
}

export function JourneyCustomizeTeamSelect(): ReactElement {
  const { values, handleChange } = useFormikContext<FormValues>()
  const { query } = useTeam()
  const teams = query?.data?.teams ?? []

  return (
    <FormControl>
      <Select
        variant="filled"
        name="teamSelect"
        value={values.teamSelect}
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Team', sx: { py: 4 } }}
        startAdornment={
          <InputAdornment position="start">
            <UsersProfiles2 />
          </InputAdornment>
        }
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
