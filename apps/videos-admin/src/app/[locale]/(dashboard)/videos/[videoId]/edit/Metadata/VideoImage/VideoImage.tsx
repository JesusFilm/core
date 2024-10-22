import { Button, Modal } from '@mui/material'
import Box from '@mui/material/Box'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'

export function VideoImage({ src, alt }): ReactElement {
  const t = useTranslations()
  const [show, setShow] = useState(false)

  const handleOpen = () => {
    setShow(true)
  }

  const handleClose = () => {
    setShow(false)
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          height: 225,
          width: { xs: 'auto', sm: 225 },
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <Image
          src={src as string}
          alt={alt ?? t('video image')}
          layout="fill"
          objectFit="cover"
          priority
        />
      </Box>
      <Button onClick={handleOpen}>Change</Button>
      <Dialog
        open={show}
        onClose={handleClose}
        dialogTitle={{ title: t('Change image'), closeButton: true }}
      >
        <h1>Modal</h1>
      </Dialog>
    </>
  )
}
