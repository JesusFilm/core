import { ReactElement } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import { useTeam } from '../TeamProvider'

export function TeamSelect(): ReactElement {
  const { query, activeTeam, setActiveTeam } = useTeam()

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <PeopleOutlineRoundedIcon sx={{ mr: 3, ml: '3px' }} />
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
              sx: { fontWeight: 'bold' }
            }}
          />
        )}
        disableClearable={activeTeam != null}
        disablePortal={process.env.NODE_ENV === 'test'}
        sx={{ width: { xs: '100%', sm: 200 } }}
      />
    </Stack>
  )
}
