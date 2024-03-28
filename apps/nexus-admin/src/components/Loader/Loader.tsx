import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { FC } from 'react'

export const Loader: FC = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        height: '100vh'
      }}
    >
      <CircularProgress />
    </Stack>
  )
}
