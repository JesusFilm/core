import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement } from 'react'

export default function Index(): ReactElement {
  return (
    <Box
      sx={{
        height: '100svh',
        maxWidth: 864,
        position: 'relative',
        margin: '0 auto'
      }}
    >
      <Image
        src="/arclight.png"
        alt="logo"
        fill
        style={{ objectFit: 'contain' }}
      />
    </Box>
  )
}
