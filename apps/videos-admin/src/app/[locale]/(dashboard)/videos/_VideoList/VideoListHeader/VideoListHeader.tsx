import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Plus2 from '@core/shared/ui/icons/Plus2'

import { VideoCreateForm } from '../VideoCreateForm'

export function VideoListHeader(): ReactElement {
  const t = useTranslations()
  const [show, setShow] = useState(false)

  return (
    <Stack
      sx={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Typography variant="h4">{t('Video Library')}</Typography>
      <Button
        onClick={() => setShow(true)}
        startIcon={<Plus2 />}
        variant="outlined"
      >
        {t('Create')}
      </Button>

      <Dialog
        open={show}
        onClose={() => setShow(false)}
        dialogTitle={{
          title: t('Create Video'),
          closeButton: true
        }}
        divider
        sx={{ '& .MuiDialog-paperFullWidth': { maxWidth: 480 } }}
      >
        <VideoCreateForm close={() => setShow(false)} />
      </Dialog>
    </Stack>
  )
}
