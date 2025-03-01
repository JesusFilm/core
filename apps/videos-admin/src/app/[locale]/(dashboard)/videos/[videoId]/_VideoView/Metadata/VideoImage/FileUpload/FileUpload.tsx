import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { Accept, useDropzone } from 'react-dropzone'

import Upload1Icon from '@core/shared/ui/icons/Upload1'

interface FileUploadProps {
  onDrop: (file: File) => Promise<void>
  accept?: Accept
  loading?: boolean
  onUploadComplete?: () => void
  noClick?: boolean
}

export function FileUpload({
  onDrop: onDropCallback,
  accept,
  loading,
  onUploadComplete,
  noClick = true
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

  const { getRootProps, open, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      noClick,
      multiple: false,
      maxSize: 10000000,
      accept
    })

  const noBorder = loading != null && loading

  const getDragStyles = () => {
    if (isDragAccept)
      return {
        bgcolor: ({ palette }) => alpha(palette.success.light, 0.25),
        borderColor: 'success.main'
      }
    if (isDragReject)
      return {
        bgcolor: ({ palette }) => alpha(palette.error.light, 0.25),
        borderColor: 'error.main'
      }
    return { bgcolor: 'background.paper', borderColor: 'divider' }
  }

  return (
    <Stack alignItems="center" gap={2}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 240,
          borderWidth: noBorder ? undefined : 2,
          backgroundColor: 'background.paper',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 1,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: noClick ? undefined : 'pointer',
          ...getDragStyles()
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input
          {...getInputProps()}
          data-testid="DropZone"
          disabled={loading === true}
        />
        {loading === true ? (
          <CircularProgress />
        ) : (
          <Stack alignItems="center" gap={1}>
            <Upload1Icon fontSize="large" />
            <Typography variant="body2" sx={{ cursor: 'pointer' }}>
              {t('Drag & drop or choose a file to upload')}
            </Typography>
          </Stack>
        )}
      </Box>
      {noClick && (
        <Button variant="outlined" fullWidth onClick={open} disabled={loading}>
          {t('Upload file')}
        </Button>
      )}
    </Stack>
  )
}
