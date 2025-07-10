'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { shouldShowEnvironmentBanner } from '../../libs/environment'

export function EnvironmentBanner(): ReactElement | null {
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL

  if (!shouldShowEnvironmentBanner()) {
    return null
  }

  const getEnvironmentName = (): string => {
    if (gatewayUrl?.includes('stage.central.jesusfilm.org')) return 'STAGE'
    return 'NON-PRODUCTION'
  }

  const environmentName = getEnvironmentName()

  return (
    <Box
      sx={{
        backgroundColor: '#ff4444',
        color: 'white',
        textAlign: 'center',
        py: 1,
        px: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        borderBottom: '2px solid #cc0000',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      <Typography variant="body2" fontWeight="bold">
        {environmentName} ENVIRONMENT
      </Typography>
    </Box>
  )
}
