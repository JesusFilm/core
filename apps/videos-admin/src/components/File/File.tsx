import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'
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
        <Typography variant="body2">{bytesToSize(file.size * 1024)}</Typography>
      </Stack>
      <Stack
        sx={{ ml: 'auto', flexDirection: 'row', alignItems: 'center', gap: 1 }}
      >
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
  )
}
