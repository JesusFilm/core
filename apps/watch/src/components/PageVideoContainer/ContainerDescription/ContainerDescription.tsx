import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Share } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ExtendedButton } from '@core/shared/ui-modern/components/extended-button'

import { TextFormatter } from '../../TextFormatter'

export interface ContainerDescriptionProps {
  value: string
  openDialog: () => void
}

export function ContainerDescription({
  value,
  openDialog
}: ContainerDescriptionProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={4}
      data-testid="ContainerDescription"
    >
      <Box>
        <TextFormatter
          slotProps={{
            typography: {
              variant: 'subtitle1',
              color: 'text.primary'
            }
          }}
        >
          {value}
        </TextFormatter>
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <ExtendedButton
          variant="outline"
          onClick={openDialog}
          className="min-w-[200px]"
        >
          <Share className="h-4 w-4" />
          {t('Share')}
        </ExtendedButton>
      </Box>
    </Stack>
  )
}
