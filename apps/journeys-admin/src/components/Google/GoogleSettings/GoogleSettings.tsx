import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ConfigField } from '../../GrowthSpaces/GrowthSpacesSettings/ConfigField/ConfigField'

interface GoogleSettingsProps {
  code?: string
  redirectUri?: string
  setCode?: (value?: string) => void
  setRedirectUri?: (value?: string) => void
  disabled?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export function GoogleSettings({
  code,
  redirectUri,
  setCode,
  setRedirectUri,
  disabled = false,
  onClick,
  onDelete: handleDelete
}: GoogleSettingsProps): ReactElement {
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
      <Typography variant="h5">{t('Google Settings')}</Typography>
      <ConfigField
        label="Authorization Code"
        value={code}
        onChange={(value) => setCode?.(value)}
      />
      <ConfigField
        label="Redirect URI"
        value={redirectUri}
        onChange={(value) => setRedirectUri?.(value)}
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
            sx={{ width: '50%' }}
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
