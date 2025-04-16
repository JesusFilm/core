'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { Accept, useDropzone } from 'react-dropzone'

import Upload1Icon from '@core/shared/ui/icons/Upload1'

interface FileUploadProps {
  onDrop?: (file: File) => Promise<void>
  onDropMultiple?: (files: File[]) => Promise<void>
  accept?: Accept
  loading?: boolean
  onUploadComplete?: () => void
  noClick?: boolean
  validator?: (file: File) => { code: string; message: string } | null
  maxFiles?: number
  maxSize?: number
}

export function FileUpload({
  onDrop: onDropCallback,
  onDropMultiple: onDropCallbackMultiple,
  accept,
  loading,
  onUploadComplete,
  noClick = true,
  validator,
  maxFiles = 1,
  maxSize
}: FileUploadProps): ReactElement {
  async function onDrop(files: File[]): Promise<void> {
    if (files.length <= 0) {
      onUploadComplete?.()
      return
    }

    if (maxFiles > 1 && onDropCallbackMultiple) {
      await onDropCallbackMultiple(files)
    } else if (onDropCallback) {
      await onDropCallback(files[0])
    }

    onUploadComplete?.()
  }

  const { getRootProps, open, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      noClick,
      multiple: maxFiles > 1,
      maxFiles: maxFiles,
      maxSize,
      accept,
      validator
    })

  const noBorder = loading != null && loading

  const getDragStyles = () => {
    if (isDragAccept) {
      return {
        bgcolor: ({ palette }) => alpha(palette.success.light, 0.25),
        borderColor: 'success.main'
      }
    } else if (isDragReject) {
      return {
        bgcolor: ({ palette }) => alpha(palette.error.light, 0.25),
        borderColor: 'error.main'
      }
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
              {maxFiles > 1
                ? `Drag & drop or choose files to upload (max ${maxFiles})`
                : 'Drag & drop or choose a file to upload'}
            </Typography>
          </Stack>
        )}
      </Box>
      {noClick && (
        <Button variant="outlined" fullWidth onClick={open} disabled={loading}>
          {maxFiles > 1 ? 'Upload files' : 'Upload file'}
        </Button>
      )}
    </Stack>
  )
}
