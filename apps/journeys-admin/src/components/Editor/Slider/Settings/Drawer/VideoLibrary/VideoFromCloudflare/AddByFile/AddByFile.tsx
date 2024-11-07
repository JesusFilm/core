import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'

import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

import { useBackgroundUpload } from '../../../../../../BackgroundUpload'

interface AddByFileProps {
  onChange: (id: string) => void
}

export function AddByFile({ onChange }: AddByFileProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [fileRejected, setfileRejected] = useState(false)
  const [fileTooLarge, setfileTooLarge] = useState(false)
  const [tooManyFiles, settooManyFiles] = useState(false)
  const [fileInvalidType, setfileInvalidType] = useState(false)
  const { uploadCloudflareVideo } = useBackgroundUpload()

  const onDrop = async (): Promise<void> => {
    setfileTooLarge(false)
    settooManyFiles(false)
    setfileInvalidType(false)
    setfileRejected(false)
  }

  const onDropAccepted = async (files: File[]): Promise<void> => {
    const upload = uploadCloudflareVideo({
      files
    })
    const uploadId = (await upload.next()).value
    void upload.next()
    onChange(uploadId, upload)
  }

  const onDropRejected = async (
    fileRejections: FileRejection[]
  ): Promise<void> => {
    setfileRejected(true)
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach((e) => {
        if (e.code === 'file-invalid-type') setfileInvalidType(true)
        if (e.code === 'file-too-large') setfileTooLarge(true)
        if (e.code === 'too-many-files') settooManyFiles(true)
      })
    })
  }

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    onDropAccepted,
    onDropRejected,
    noClick: true,
    multiple: false,
    maxSize: 1000000000,
    accept: {
      'video/*': []
    }
  })

  return (
    <Stack
      alignItems="center"
      gap={1}
      sx={{ px: 6, py: 3 }}
      data-testid="AddByFile"
    >
      <Box
        data-testid="drop zone"
        sx={{
          mt: 3,
          display: 'flex',
          width: '100%',
          height: 162,
          borderWidth: fileRejected ? undefined : 2,
          backgroundColor: isDragAccept
            ? 'rgba(239, 239, 239, 0.9)'
            : fileRejected
              ? 'rgba(197, 45, 58, 0.08)'
              : 'rgba(239, 239, 239, 0.35)',
          borderColor: 'divider',
          borderStyle: fileRejected ? undefined : 'dashed',
          borderRadius: 2,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input {...getInputProps()} />
        <Upload1Icon sx={{ fontSize: 48, color: 'secondary.light', mb: 1 }} />
        <Typography
          variant="body1"
          color={fileRejected ? 'error.main' : 'secondary.main'}
          sx={{ pb: 4 }}
        >
          {fileRejected && t('Upload Failed!')}
          {!fileRejected && t('Drop a video here')}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={fileRejected ? 'error.main' : 'secondary.light'}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <AlertTriangleIcon
          fontSize="small"
          sx={{
            display: fileRejected ? 'flex' : 'none'
          }}
        />
        {fileRejected ? (
          <Typography variant="caption">
            {fileInvalidType && t('Invalid file type. ')}
            {tooManyFiles && t('Only one file upload at once. ')}
            {fileTooLarge && t('File is too large. Max size is 1 GB.')}
          </Typography>
        ) : (
          <Typography variant="caption">{t('Max size is 1 GB')}</Typography>
        )}
      </Stack>

      <Button
        size="small"
        color="secondary"
        variant="outlined"
        onClick={open}
        sx={{
          mt: 4,
          height: 32,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Typography
          variant="subtitle2"
          fontSize={14}
          sx={{ color: 'secondary.main' }}
        >
          {t('Upload file')}
        </Typography>
      </Button>
    </Stack>
  )
}
