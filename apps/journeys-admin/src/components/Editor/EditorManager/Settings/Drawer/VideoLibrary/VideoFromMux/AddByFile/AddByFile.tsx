import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { UpChunk } from '@mux/upchunk'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'

import AlertTriangleIcon from '@core/shared/ui/icons/AlertTriangle'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

import { CreateMuxVideoUploadByFileMutation } from '../../../../../../../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { GetMyMuxVideoQuery } from '../../../../../../../../../__generated__/GetMyMuxVideoQuery'

import { fileToMuxUpload } from './utils/addByFileUtils'

export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation CreateMuxVideoUploadByFileMutation($name: String!) {
    createMuxVideoUploadByFile(name: $name) {
      uploadUrl
      id
    }
  }
`

export const GET_MY_MUX_VIDEO_QUERY = gql`
  query GetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`

interface AddByFileProps {
  onChange: (id: string) => void
}

export function AddByFile({ onChange }: AddByFileProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [fileRejected, setfileRejected] = useState(false)
  const [fileTooLarge, setfileTooLarge] = useState(false)
  const [tooManyFiles, settooManyFiles] = useState(false)
  const [fileInvalidType, setfileInvalidType] = useState(false)
  const [error, setError] = useState<Error>()
  const [progress, setProgress] = useState(0)

  function resetUploadStatus(): void {
    setUploading(false)
    setProcessing(false)
    setProgress(0)
  }

  const [createMuxVideoUploadByFile, { data }] =
    useMutation<CreateMuxVideoUploadByFileMutation>(
      CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
    )
  const [getMyMuxVideo, { stopPolling }] = useLazyQuery<GetMyMuxVideoQuery>(
    GET_MY_MUX_VIDEO_QUERY,
    {
      pollInterval: 1000,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        if (
          data.getMyMuxVideo.playbackId != null &&
          data.getMyMuxVideo.assetId != null &&
          data.getMyMuxVideo.readyToStream
        ) {
          stopPolling()
          onChange(data.getMyMuxVideo.id)
          resetUploadStatus()
        }
      }
    }
  )

  useEffect(() => {
    if (processing && data?.createMuxVideoUploadByFile?.id != null) {
      void getMyMuxVideo({
        variables: { id: data.createMuxVideoUploadByFile.id }
      })
    }
  }, [processing, getMyMuxVideo, data?.createMuxVideoUploadByFile?.id])

  const onDrop = async (): Promise<void> => {
    setfileTooLarge(false)
    settooManyFiles(false)
    setfileInvalidType(false)
    setfileRejected(false)
    setError(undefined)
  }

  function uploadVideo(
    file: File,
    data: CreateMuxVideoUploadByFileMutation
  ): void {
    setUploading(true)
    const upload = UpChunk.createUpload({
      file,
      endpoint: data.createMuxVideoUploadByFile.uploadUrl ?? '',
      chunkSize: 5120
    })
    upload.on('success', (): void => {
      setUploading(false)
      setProcessing(true)
    })
    upload.on('error', (err): void => {
      setError(err.detail)
      resetUploadStatus()
    })
    upload.on('progress', (progress): void => {
      setProgress(progress.detail)
    })
  }

  const onDropAccepted = async (files: File[]): Promise<void> => {
    if (files.length > 0) {
      const { data } = await createMuxVideoUploadByFile(
        fileToMuxUpload(files[0])
      )

      if (
        data?.createMuxVideoUploadByFile?.uploadUrl != null &&
        data?.createMuxVideoUploadByFile?.id != null
      ) {
        uploadVideo(files[0], data)
      }
    }
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
        {...getRootProps({ isDragAccept })}
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
          {uploading && t('Uploading...')}
          {processing && t('Processing...')}
          {(error != null || fileRejected) && t('Upload Failed!')}
          {!uploading &&
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

      {uploading || processing ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress
            variant={processing ? 'indeterminate' : 'determinate'}
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
