import Upload1Icon from '@mui/icons-material/CloudUpload'
import AlertTriangleIcon from '@mui/icons-material/Warning'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'

interface AudioLanguageFileUploadProps {
  disabled?: boolean
  onFileSelect: (file: File) => void
  loading?: boolean
  error?: string
  uploading?: boolean
  processing?: boolean
  selectedFile?: File | null
}

export function AudioLanguageFileUpload({
  disabled,
  onFileSelect,
  loading,
  error,
  uploading,
  processing,
  selectedFile
}: AudioLanguageFileUploadProps): ReactElement {
  const t = useTranslations()
  const [fileRejected, setFileRejected] = useState(false)
  const [fileInvalidType, setFileInvalidType] = useState(false)

  const onDrop = async (): Promise<void> => {
    setFileRejected(false)
    setFileInvalidType(false)
  }

  const onDropAccepted = async (files: File[]): Promise<void> => {
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const onDropRejected = async (
    fileRejections: FileRejection[]
  ): Promise<void> => {
    setFileRejected(true)
    fileRejections.forEach(({ errors }) => {
      errors.forEach((e) => {
        if (e.code === 'file-invalid-type') setFileInvalidType(true)
      })
    })
  }

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    onDropAccepted,
    onDropRejected,
    noClick: true,
    multiple: false,
    disabled: disabled || loading,
    accept: {
      'video/*': []
    }
  })

  const noBorder = error != null || uploading || fileRejected
  const isDisabled = disabled || loading || uploading || processing

  return (
    <Stack
      alignItems="center"
      gap={1}
      sx={{ px: 6, py: 3 }}
      data-testid="AudioLanguageFileUpload"
    >
      <Box
        data-testid="AudioLanguageDropZone"
        sx={{
          mt: 3,
          display: 'flex',
          width: '100%',
          height: 162,
          borderWidth: noBorder ? undefined : 2,
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 2,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input {...getInputProps()} data-testid="DropZone" />
        {error != null || fileRejected ? (
          <AlertTriangleIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
          />
        ) : (
          <Upload1Icon sx={{ fontSize: 48, color: 'secondary.light', mb: 1 }} />
        )}
        <Typography
          variant="body1"
          color={
            error != null || fileRejected ? 'error.main' : 'secondary.light'
          }
          sx={{ pb: 4 }}
        >
          {uploading && t('Uploading...')}
          {processing && t('Processing...')}
          {(error != null || fileRejected) && t('Upload Failed!')}
          {!uploading &&
            !processing &&
            !fileRejected &&
            error == null &&
            selectedFile == null &&
            t('Drop a video here')}
          {!uploading &&
            !processing &&
            !fileRejected &&
            error == null &&
            selectedFile != null &&
            selectedFile.name}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={error != null || fileRejected ? 'error.main' : 'secondary.light'}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <AlertTriangleIcon
          fontSize="small"
          sx={{
            display: error != null || fileRejected ? 'flex' : 'none'
          }}
        />
        {error != null ? (
          <Typography variant="caption">
            {t('Something went wrong, try again')}
          </Typography>
        ) : fileRejected ? (
          <Typography variant="caption">
            {fileInvalidType && t('Invalid file type. ')}
          </Typography>
        ) : null}
      </Stack>

      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={open}
        disabled={isDisabled}
        sx={{
          mt: 4,
          height: 32,
          width: '100%',
          borderRadius: 2,
          opacity: isDisabled ? 0.3 : 1
        }}
      >
        <Typography
          variant="subtitle2"
          fontSize={14}
          sx={{ color: 'secondary.light' }}
        >
          {selectedFile != null ? t('Change file') : t('Upload file')}
        </Typography>
      </Button>
    </Stack>
  )
}
