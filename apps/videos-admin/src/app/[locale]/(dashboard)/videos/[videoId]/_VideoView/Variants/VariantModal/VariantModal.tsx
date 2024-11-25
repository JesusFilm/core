import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Modal, { ModalProps } from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { Downloads } from '../Downloads'

interface VariantModalProps extends Omit<ModalProps, 'children'> {
  variant?: GetAdminVideoVariant
}

export function VariantModal({
  variant,
  open,
  onClose
}: VariantModalProps): ReactElement | null {
  const t = useTranslations()

  if (variant == null) return null

  return (
    <Modal open={open} onClose={onClose}>
      <Stack
        gap={2}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 4
        }}
      >
        <Typography variant="h2">{t('Variant')}</Typography>
        <Typography variant="h6">{variant.language.name[0].value}</Typography>
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
    </Modal>
  )
}
