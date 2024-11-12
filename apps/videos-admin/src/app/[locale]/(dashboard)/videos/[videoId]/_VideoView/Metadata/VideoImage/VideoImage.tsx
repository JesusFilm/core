import { Button, IconButton, Modal } from '@mui/material'
import Box from '@mui/material/Box'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import { VideoImageUpload } from './VideoImageUpload'
import { GetAdminVideo } from '../../../../../../../../libs/useAdminVideo'
import Edit2 from '@core/shared/ui/icons/Edit2'

function getImageFields(video): { src: string | null; alt: string | null } {
  if (video == null) return { src: null, alt: null }
  const src = video?.images?.at(-1).mobileCinematicHigh
  const alt = video?.imageAlt?.at(-1).value

  return {
    src,
    alt
  }
}

interface VideoImageProps {
  video: GetAdminVideo['adminVideo']
}

export function VideoImage({ video }: VideoImageProps): ReactElement {
  const t = useTranslations()
  const [show, setShow] = useState(false)

  const handleOpen = () => {
    setShow(true)
  }

  const handleClose = () => {
    setShow(false)
  }

  const { src, alt } = getImageFields(video)

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          height: 225,
          width: { xs: 'auto', sm: 400 },
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
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <Edit2 />
        </IconButton>
      </Box>
      <Dialog
        open={show}
        onClose={handleClose}
        dialogTitle={{ title: t('Change Image'), closeButton: true }}
        slotProps={{ titleButton: { size: 'small' } }}
        sx={{
          '& .MuiPaper-root': { maxWidth: 400 }
        }}
      >
        <VideoImageUpload video={video} />
      </Dialog>
    </>
  )
}
