import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Edit2 from '@core/shared/ui/icons/Edit2'

import { GetAdminVideo } from '../../../../../../../../libs/useAdminVideo'

import { VideoImageUpload } from './VideoImageUpload'

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

  const handleOpen = (): void => {
    setShow(true)
  }

  const handleClose = (): void => {
    setShow(false)
  }

  const { src, alt } = getImageFields(video)

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          // width: { xs: 'auto', sm: 400 },
          width: { xs: 'auto' },
          aspectRatio: '32 / 15',
          maxHeight: 225,
          height: 225,
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
