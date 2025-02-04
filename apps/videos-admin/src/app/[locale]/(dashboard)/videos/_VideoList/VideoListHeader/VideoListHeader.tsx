import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { VideoCreateForm } from '../VideoCreateForm'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid',
  borderColor: 'divider',
  borderRadius: 2,
  p: 4
}

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
      <Modal open={show} onClose={() => setShow(false)}>
        <Box sx={style}>
          <VideoCreateForm onCancel={() => setShow(false)} />
        </Box>
      </Modal>
    </Stack>
  )
}
