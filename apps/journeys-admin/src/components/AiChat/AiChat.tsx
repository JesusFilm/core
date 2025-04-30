import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function AiChat(): ReactElement {
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
        zIndex: 1200
      }}
    >
      <Paper
        sx={{
          borderRadius: 3,
          width: '100%',
          backgroundColor: 'background.paper'
        }}
      >
        <Stack sx={{ px: 4, py: 4, height: '100%', width: '100%', gap: 4 }}>
          <Typography variant="h3">{t('A.I Edit')}</Typography>
          <Stack direction="row" justifyContent="space-between" gap={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: 400,
                overflowY: 'scroll',
                width: '100%'
              }}
            />
            <Stack direction="column" gap={2} height="100%">
              <TextField
                label={t('System Prompt')}
                multiline
                rows={4}
                fullWidth
                aria-label={t('System Prompt')}
              />
              <TextField
                label={t('Prompt')}
                multiline
                rows={4}
                fullWidth
                aria-label={t('Prompt')}
              />
              <Button
                variant="contained"
                color="primary"
                aria-label={t('Generate')}
              >
                {t('Generate')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
