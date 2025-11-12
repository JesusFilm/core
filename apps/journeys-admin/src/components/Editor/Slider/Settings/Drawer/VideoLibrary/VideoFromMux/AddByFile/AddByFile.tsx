import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

import { validateMuxLanguage } from '../../../../../../../../libs/validateMuxLanguage'
import { useMuxVideoUpload } from '../../../../../../../MuxVideoUploadProvider'

interface AddByFileProps {
  onChange: (id: string, shouldCloseDrawer?: boolean) => void
}

export function AddByFile({ onChange }: AddByFileProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedBlock }
  } = useEditor()
  const rawLanguageCode = journey?.language?.bcp47
  const isValidLanguage = validateMuxLanguage(rawLanguageCode)
  const languageCode =
    isValidLanguage && rawLanguageCode != null ? rawLanguageCode : undefined
  const languageName = journey?.language?.name?.find(
    (name) => name.primary
  )?.value

  const { getUploadStatus, addUploadTask } = useMuxVideoUpload()

  const videoBlockId = selectedBlock?.id ?? null
  const uploadTask = videoBlockId != null ? getUploadStatus(videoBlockId) : null

  const [fileRejected, setFileRejected] = useState(false)
  const [fileTooLarge, setFileTooLarge] = useState(false)
  const [tooManyFiles, setTooManyFiles] = useState(false)
  const [fileInvalidType, setFileInvalidType] = useState(false)

  const uploading = uploadTask?.status === 'uploading'
  const processing = uploadTask?.status === 'processing'
  const waiting = uploadTask?.status === 'waiting'
  const error = uploadTask?.error
  const progress = uploadTask?.progress ?? 0

  const onDrop = async (): Promise<void> => {
    setFileRejected(false)
    setFileTooLarge(false)
    setTooManyFiles(false)
    setFileInvalidType(false)
  }

  const onDropAccepted = async (files: File[]): Promise<void> => {
    if (files.length > 0 && videoBlockId != null) {
      // Check if task already exists
      if (uploadTask != null) {
        // Task already exists, don't add another
        return
      }

      // Add upload task
      addUploadTask(
        videoBlockId,
        files[0],
        languageCode,
        languageName,
        (videoId) => {
          // Always call onChange to persist the mutation
          // Don't close drawer, user may have navigated to different block during upload
          // and closing drawer would interrupt their workflow.
          const shouldCloseDrawer = false
          onChange(videoId, shouldCloseDrawer)
        }
      )
    }
  }

  const onDropRejected = async (
    fileRejections: FileRejection[]
  ): Promise<void> => {
    setFileRejected(true)
    setFileTooLarge(false)
    setTooManyFiles(false)
    setFileInvalidType(false)

    fileRejections.forEach(({ errors }) => {
      errors.forEach((e) => {
        if (e.code === 'file-invalid-type') setFileInvalidType(true)
        if (e.code === 'file-too-large') setFileTooLarge(true)
        if (e.code === 'too-many-files') setTooManyFiles(true)
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
    },
    disabled: videoBlockId == null || uploadTask != null
  })

  const noBorder = error != null || uploading || fileRejected

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
            isDragAccept || uploading
              ? 'rgba(239, 239, 239, 0.9)'
              : error != null || fileRejected
                ? 'rgba(197, 45, 58, 0.08)'
                : 'rgba(239, 239, 239, 0.35)',
          borderColor: 'divider',
          borderStyle: noBorder ? undefined : 'dashed',
          borderRadius: 2,
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
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
            error != null || fileRejected ? 'error.main' : 'secondary.main'
          }
          sx={{ pb: 4 }}
        >
          {waiting && t('Waiting in queue...')}
          {uploading && t('Uploading...')}
          {processing && t('Processing...')}
          {(error != null || fileRejected) && t('Upload Failed!')}
          {!waiting &&
            !uploading &&
            !processing &&
            !fileRejected &&
            error == null &&
            t('Drop a video here')}
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
            {tooManyFiles && t('Only one file upload at once. ')}
            {fileTooLarge && t('File is too large. Max size is 1 GB.')}
          </Typography>
        ) : (
          <Typography variant="caption">{t('Max size is 1 GB')}</Typography>
        )}
      </Stack>

      {waiting || uploading || processing ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress
            variant={processing || waiting ? 'indeterminate' : 'determinate'}
            value={progress}
            sx={{ height: 32, borderRadius: 2 }}
          />
        </Box>
      ) : (
        <Button
          size="small"
          color="secondary"
          variant="outlined"
          onClick={open}
          disabled={videoBlockId == null || uploadTask != null}
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
            {videoBlockId == null
              ? t('Select a video block first')
              : t('Upload file')}
          </Typography>
        </Button>
      )}
    </Stack>
  )
}
