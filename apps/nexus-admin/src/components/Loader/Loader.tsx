import { CircularProgress, Stack } from '@mui/material'
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
