import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { AiChatForm } from '../AiChatForm/AiChatForm'

interface AiChatProps {
  open?: boolean
}

export function AiChat({ open = false }: AiChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 100,
        right: 200,
        width: '100%',
        borderRadius: 4,
        background:
          'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
        p: '6px',
        minWidth: { xs: '100%', md: 800 },
        zIndex: 1200,
        display: open ? 'block' : 'none'
      }}
    >
      <Paper
        sx={{
          borderRadius: 3,
          width: '100%',
          backgroundColor: 'background.paper'
        }}
      >
        <AiChatForm />
      </Paper>
    </Box>
  )
}
