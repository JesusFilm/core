import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { Accept, useDropzone } from 'react-dropzone'
import CircularProgress from '@mui/material/CircularProgress'

import Upload1Icon from '@core/shared/ui/icons/Upload1'
import { useTranslations } from 'next-intl'

interface FileUploadProps {
  onDrop: (file: File) => Promise<void>
  accept?: Accept
  loading?: boolean
  onUploadComplete?: () => void
}

export function FileUpload({
  onDrop: onDropCallback,
  accept,
  loading,
  onUploadComplete
}: FileUploadProps): ReactElement {
  const t = useTranslations()
  async function onDrop(files: File[]): Promise<void> {
    if (files.length <= 0) {
      onUploadComplete?.()
      return
    }
    await onDropCallback(files[0])
    onUploadComplete?.()
  }

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
    maxSize: 10000000,
    accept
  })

  const noBorder = loading != null && loading

  return (
    <Stack alignItems="center" gap={2}>
      <Box
        sx={{
          mt: 3,
          display: 'flex',
          width: '100%',
          height: 240,
          borderWidth: noBorder ? undefined : 2,
          backgroundColor: 'background.paper',
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 1,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input
          {...getInputProps()}
          data-testid="DropZone"
          disabled={loading === true}
        />
        {loading === true ? <CircularProgress /> : <Upload1Icon />}
      </Box>
      <Button variant="outlined" fullWidth onClick={open}>
        {t('Upload file')}
      </Button>
    </Stack>
  )
}
