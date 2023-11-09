import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

interface TemplateCreatorDetailsProps {
  sx?: SxProps
  creatorImage?: string | null
  creatorDetails?: string | null
}

export function TemplateCreatorDetails({
  sx,
  creatorImage,
  creatorDetails
}: TemplateCreatorDetailsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      sx={{
        borderWidth: { xs: 0, sm: 1 },
        borderStyle: 'solid',
        borderColor: 'divider',
        borderTop: 'none',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        ...sx
      }}
    >
      {creatorImage != null && (
        <Avatar
          src={creatorImage}
          sx={{
            mt: { xs: 2, sm: -5 },
            mr: { xs: 3, sm: 0 },
            borderWidth: { xs: 0, sm: '2px' },
            borderStyle: 'solid',
            borderColor: 'background.paper'
          }}
        />
      )}
      {creatorDetails != null && (
        <Box
          sx={{
            px: { xs: 0, sm: 5 },
            pb: { xs: 4, sm: 5 },
            pt: { xs: 2, sm: 4 }
          }}
        >
          <Typography
            variant="subtitle3"
            sx={{ color: { xs: 'text.primary', sm: 'secondary.light' } }}
          >
            {t('{{ creatorDetails }}', { creatorDetails })}
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
