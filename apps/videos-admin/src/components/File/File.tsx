import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Download2 from '@core/shared/ui/icons/Download2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import File5 from '@core/shared/ui/icons/File5'
import Image3 from '@core/shared/ui/icons/Image3'
import Trash2 from '@core/shared/ui/icons/Trash2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

import { bytesToSize } from '../../app/[locale]/(dashboard)/videos/[videoId]/_VideoView/Variants/VariantDialog/Downloads/utils/bytesToSize'

import { TextPreview } from './TextPreview'

export function File({
  file,
  actions
}: {
  file: File
  actions?: {
    onDelete?: () => void
    onDownload?: () => void
  }
  downloadable?: boolean
}): ReactElement {
  const [type, setType] = useState<'text' | 'image' | 'video' | null>(null)
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    if (file.type != null) {
      if (file.type.startsWith('image/')) {
        setType('image')
      }
      if (file.type.startsWith('text/')) {
        setType('text')
      }
      if (file.type.startsWith('video/')) {
        setType('video')
      }
    }
  }, [file])

  const getFileIcon = (file: File): ReactElement => {
    if (file.type.startsWith('image/')) {
      return <Image3 />
    }
    if (file.type.startsWith('text/')) {
      return <File5 />
    }
    if (file.type.startsWith('video/')) {
      return <VideoOn />
    }
    return <File5 />
  }

  return (
    <>
      <Paper
        sx={{
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          width: '100%'
        }}
        data-testid="File"
      >
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            borderRadius: 1,
            height: 40,
            width: 40
          }}
        >
          {getFileIcon(file)}
        </Box>
        <Stack>
          <Typography variant="subtitle2" fontWeight={600}>
            {file.name}
          </Typography>
          <Typography variant="body2">{bytesToSize(file.size)}</Typography>
        </Stack>
        <Stack
          sx={{
            ml: 'auto',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}
        >
          <IconButton onClick={() => setShow(true)} aria-label="view-file">
            <EyeOpen fontSize="small" />
          </IconButton>
          {actions?.onDownload != null && (
            <IconButton onClick={actions.onDownload} aria-label="download-file">
              <Download2 fontSize="small" />
            </IconButton>
          )}
          {actions?.onDelete != null && (
            <IconButton onClick={actions.onDelete} aria-label="delete-file">
              <Trash2 fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Paper>
      <Dialog
        open={show}
        onClose={() => setShow(false)}
        dialogTitle={{
          title: 'Preview',
          closeButton: true
        }}
      >
        {type === 'text' && file != null && <TextPreview file={file} />}
        {/* {preview === 'image' && <ImagePreview file={file} />} */}
        {/* {preview === 'video' && <VideoPreview file={file} />} */}
      </Dialog>
    </>
  )
}
