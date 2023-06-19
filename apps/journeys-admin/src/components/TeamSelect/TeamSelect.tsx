import { ReactElement } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { useTeam } from '../TeamProvider'

export function TeamSelect(): ReactElement {
  const { query, activeTeam, setActiveTeam } = useTeam()

  return (
    <Autocomplete
      loading={query?.loading}
      onChange={(_event, value) => setActiveTeam(value)}
      value={activeTeam}
      options={query.data?.teams ?? []}
      getOptionLabel={(option) => option?.title ?? ''}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          name="Team"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <PeopleOutlineRoundedIcon />
              </InputAdornment>
            ),
            sx: { fontWeight: 'bold' }
          }}
        />
      )}
      disableClearable={activeTeam != null}
      disablePortal={process.env.NODE_ENV === 'test'}
      sx={{ width: 300 }}
    />
  )
}
