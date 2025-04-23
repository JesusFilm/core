import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Download2 from '@core/shared/ui/icons/Download2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import File5 from '@core/shared/ui/icons/File5'
import Image3 from '@core/shared/ui/icons/Image3'
import Trash2 from '@core/shared/ui/icons/Trash2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

import { bytesToSize } from '../../app/(dashboard)/videos/[videoId]/audio/[variantId]/download/_bytesToSize/bytesToSize'

import { TextPreview } from './TextPreview'

interface FileProps {
  file: File
  type: 'text' | 'image' | 'video'
  actions?: {
    onDelete?: () => void
    onDownload?: () => void
  }
}

export function File({ file, type, actions }: FileProps): ReactElement {
  const [show, setShow] = useState<boolean>(false)

  const getFileIcon = (): ReactElement => {
    switch (type) {
      case 'image':
        return <Image3 />
      case 'text':
        return <File5 />
      case 'video':
        return <VideoOn />
      default:
        return <File5 />
    }
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
          {getFileIcon()}
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
          {type != null && (
            <IconButton onClick={() => setShow(true)} aria-label="view-file">
              <EyeOpen fontSize="small" />
            </IconButton>
          )}
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
