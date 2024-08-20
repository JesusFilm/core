import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

import { ConfigField } from './ConfigField'

interface GrowthSpacesSettingsProps {
  accessId?: string
  accessSecret?: string
  setAccessId?: (value?: string) => void
  setAccessSecret?: (value?: string) => void
  disabled?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export function GrowthSpacesSettings({
  accessId,
  accessSecret,
  setAccessId,
  setAccessSecret,
  disabled = false,
  onClick,
  onDelete: handleDelete
}: GrowthSpacesSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box
      sx={{
        p: 6,
        gap: 4,
        mt: 20,
        mx: 'auto',
        width: '60%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderRadius: 4,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="h5">{t('App Settings')}</Typography>
      <ConfigField
        label="Access ID"
        value={accessId}
        onChange={(value) => setAccessId?.(value)}
      />
      <ConfigField
        label="Access Secret"
        value={accessSecret}
        onChange={(value) => setAccessSecret?.(value)}
      />
      <Stack
        gap={4}
        flexDirection="row"
        justifyContent="flex-end"
        sx={{ width: '40%', alignSelf: 'flex-end' }}
      >
        {handleDelete != null && (
          <Button
            onClick={handleDelete}
            disabled={disabled}
            sx={{
              width: '50%'
            }}
          >
            {t('Remove')}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onClick}
          disabled={disabled}
          sx={{ width: '50%' }}
        >
          {t('Save')}
        </Button>
      </Stack>
    </Box>
  )
}
