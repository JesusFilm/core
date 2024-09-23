import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'
import { HttpStack } from 'tus-js-client'

import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

import { useBackgroundUpload } from '../../../../../../BackgroundUpload'
import { UploadStatus } from '../../../../../../BackgroundUpload/BackgroundUploadContext'

interface AddByFileProps {
  onChange: (id: string) => void
  httpStack?: HttpStack // required for testing in jest
}

export function AddByFile({
  onChange,
  httpStack
}: AddByFileProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [fileRejected, setfileRejected] = useState(false)
  const [fileTooLarge, setfileTooLarge] = useState(false)
  const [tooManyFiles, settooManyFiles] = useState(false)
  const [fileInvalidType, setfileInvalidType] = useState(false)
  const { uploadQueue, uploadCloudflareVideo } = useBackgroundUpload()

  // let uploadQueueItem: string | undefined
  const [activeQueueItem, setActiveQueueItem] = useState<string>('')

  const onDrop = async (): Promise<void> => {
    setfileTooLarge(false)
    settooManyFiles(false)
    setfileInvalidType(false)
    setfileRejected(false)
  }

  const onDropAccepted = async (files: File[]): Promise<void> => {
    setActiveQueueItem(
      await uploadCloudflareVideo({
        files,
        httpStack,
        onChange
      })
    )
  }

  const onDropRejected = async (
    fileRejections: FileRejection[]
  ): Promise<void> => {
    setfileRejected(true)
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach((e) => {
        if (e.code === 'file-invalid-type') {
          setfileInvalidType(true)
        }
        if (e.code === 'file-too-large') {
          setfileTooLarge(true)
        }

        if (e.code === 'too-many-files') {
          settooManyFiles(true)
        }
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

  const noBorder =
    uploadQueue[activeQueueItem]?.error != null ||
    uploadQueue[activeQueueItem]?.status === UploadStatus.uploading ||
    fileRejected

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
          borderWidth: noBorder ? undefined : 2,
          backgroundColor:
            isDragAccept ||
            uploadQueue[activeQueueItem]?.status === UploadStatus.uploading
              ? 'rgba(239, 239, 239, 0.9)'
              : uploadQueue[activeQueueItem]?.error != null || fileRejected
              ? 'rgba(197, 45, 58, 0.08)'
              : 'rgba(239, 239, 239, 0.35)',
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 2,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps({ isDragAccept })}
      >
        <input {...getInputProps()} />
        {uploadQueue[activeQueueItem]?.error != null || fileRejected ? (
          <AlertTriangleIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
          />
        ) : (
          <Upload1Icon sx={{ fontSize: 48, color: 'secondary.light', mb: 1 }} />
        )}
        <Typography
          variant="body1"
          color={
            uploadQueue[activeQueueItem]?.error != null || fileRejected
              ? 'error.main'
              : 'secondary.main'
          }
          sx={{ pb: 4 }}
        >
          {uploadQueue[activeQueueItem]?.status === UploadStatus.uploading &&
            t('Uploading...')}
          {uploadQueue[activeQueueItem]?.status === UploadStatus.processing &&
            t('Processing...')}
          {(uploadQueue[activeQueueItem]?.error != null || fileRejected) &&
            t('Upload Failed!')}
          {uploadQueue[activeQueueItem]?.status !== UploadStatus.uploading &&
            !fileRejected &&
            uploadQueue[activeQueueItem]?.error == null &&
            t('Drop a video here')}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={
          uploadQueue[activeQueueItem]?.error != null || fileRejected
            ? 'error.main'
            : 'secondary.light'
        }
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <AlertTriangleIcon
          fontSize="small"
          sx={{
            display:
              uploadQueue[activeQueueItem]?.error != null || fileRejected
                ? 'flex'
                : 'none'
          }}
        />
        {uploadQueue[activeQueueItem]?.error != null ? (
          <Typography variant="caption">
            {t('Something went wrong, try again')}
          </Typography>
        ) : fileRejected ? (
          <Typography variant="caption">
            {fileInvalidType && t('Invalid file type. ')}
            {tooManyFiles && t('Only one file upload at once. ')}
            {fileTooLarge && t('File is too large. Max size is 1 GB.')}
          </Typography>
        ) : (
          <Typography variant="caption">{t('Max size is 1 GB')}</Typography>
        )}
      </Stack>

      {(
        [UploadStatus.uploading, UploadStatus.processing] as Array<
          UploadStatus | undefined
        >
      ).includes(uploadQueue[activeQueueItem]?.status) ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress
            variant={
              uploadQueue[activeQueueItem]?.status === UploadStatus.processing
                ? 'indeterminate'
                : 'determinate'
            }
            value={uploadQueue[activeQueueItem]?.progress ?? 0}
            sx={{ height: 32, borderRadius: 2 }}
          />
        </Box>
      ) : (
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
      )}
    </Stack>
  )
}
