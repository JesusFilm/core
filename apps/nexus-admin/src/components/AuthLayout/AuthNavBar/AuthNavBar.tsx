import { Stack, Typography } from '@mui/material'
import { FC } from 'react'

export const AuthNavBar: FC = () => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        height: '48px',
        backgroundColor: '#26262E',
        px: 6
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Montserrat',
          textTransform: 'uppercase',
          fontWeight: 700,
          fontSize: '16px',
          color: '#EF3344',
          borderRight: '1px solid #6C7680',
          pr: 2,
          mr: 2
        }}
      >
        Nexus
      </Typography>
      <Typography
        sx={{
          fontFamily: 'Montserrat',
          fontWeight: 400,
          fontSize: '12px',
          color: '#ffffff'
        }}
      >
        Youtube Uploader
      </Typography>
    </Stack>
  )
}
