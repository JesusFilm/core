import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { Theme } from '@mui/material/styles'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { Downloads } from '../Downloads'
import useMediaQuery from '@mui/material/useMediaQuery'

interface VariantModalProps {
  variant?: GetAdminVideoVariant
  onClose: () => void
  open: boolean
}

export function VariantModal({
  variant,
  open,
  onClose
}: VariantModalProps): ReactElement | null {
  const t = useTranslations()

  if (variant == null) return null

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullscreen={!smUp}
      dialogTitle={{ title: t('Variant'), closeButton: true }}
      slotProps={{ titleButton: { size: 'small' } }}
      divider
    >
      <Stack gap={4}>
        <Typography variant="h2">{variant.language.name[0].value}</Typography>
        <FormControl>
          <Stack direction="row">
            <Stack direction="column">
              <FormLabel>{t('Slug')}</FormLabel>
              <TextField disabled defaultValue={variant.slug} />
            </Stack>
          </Stack>
        </FormControl>
        <Downloads downloads={variant.downloads} />
      </Stack>
    </Dialog>
  )
}
