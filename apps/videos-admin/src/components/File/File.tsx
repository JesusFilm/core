import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Download2 from '@core/shared/ui/icons/Download2'
import EyeOpen from '@core/shared/ui/icons/EyeOpen'
import File5 from '@core/shared/ui/icons/File5'
import Image3 from '@core/shared/ui/icons/Image3'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { bytesToSize } from '../../app/[locale]/(dashboard)/videos/[videoId]/_VideoView/Variants/VariantDialog/Downloads/utils/bytesToSize'

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
  const [show, setShow] = useState(false)
  const content = useRef<any>(null)

  useEffect(() => {
    if (file != null) {
      const fileReader = new FileReader()
      fileReader.onloadend = () => {
        content.current = fileReader.result
      }
      fileReader.readAsText(file)
    }
  }, [file])

  const getFileIcon = (file: File): ReactElement => {
    if (file.type.startsWith('image/')) {
      return <Image3 />
    }
    if (file.type.startsWith('text/')) {
      return <File5 />
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
          <IconButton onClick={() => setShow(true)}>
            <EyeOpen fontSize="small" />
          </IconButton>
          {actions?.onDownload != null && (
            <IconButton onClick={actions.onDownload}>
              <Download2 fontSize="small" />
            </IconButton>
          )}
          {actions?.onDelete != null && (
            <IconButton onClick={actions.onDelete}>
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
        <Box
          sx={{
            borderRadius: 1,
            bgcolor: 'background.default',
            p: 2,
            maxHeight: 640,
            overflowY: 'auto'
          }}
        >
          <pre style={{ whiteSpace: 'pre-wrap' }}>{content.current}</pre>
        </Box>
      </Dialog>
    </>
  )
}
