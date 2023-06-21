import type { ReadStream } from 'fs'
import { ReactElement, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded'
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded'
import {
  DefaultHttpStack,
  DetailedError,
  HttpStack,
  Upload
} from 'tus-js-client'
import LinearProgress from '@mui/material/LinearProgress'
import { CreateCloudflareVideoUploadByFileMutation } from '../../../../../../__generated__/CreateCloudflareVideoUploadByFileMutation'
import { GetMyCloudflareVideoQuery } from '../../../../../../__generated__/GetMyCloudflareVideoQuery'

export const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation CreateCloudflareVideoUploadByFileMutation(
    $uploadLength: Int!
    $name: String!
  ) {
    createCloudflareVideoUploadByFile(
      uploadLength: $uploadLength
      name: $name
    ) {
      uploadUrl
      id
    }
  }
`

export const GET_MY_CLOUDFLARE_VIDEO_QUERY = gql`
  query GetMyCloudflareVideoQuery($id: ID!) {
    getMyCloudflareVideo(id: $id) {
      id
      readyToStream
    }
  }
`

interface AddByFileProps {
  onChange: (id: string) => void
  httpStack?: HttpStack // required for testing in jest
}

export function AddByFile({
  onChange,
  httpStack
}: AddByFileProps): ReactElement {
  const [createCloudflareVideoUploadByFile, { data }] =
    useMutation<CreateCloudflareVideoUploadByFileMutation>(
      CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION
    )
  const [getMyCloudflareVideo, { data: getMyCloudflareVideoData }] =
    useLazyQuery<GetMyCloudflareVideoQuery>(GET_MY_CLOUDFLARE_VIDEO_QUERY, {
      pollInterval: 1000
    })
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [fileRejected, setfileRejected] = useState(false)
  const [fileTooLarge, setfileTooLarge] = useState(false)
  const [tooManyFiles, settooManyFiles] = useState(false)
  const [fileInvalidType, setfileInvalidType] = useState(false)
  const [error, setError] = useState<Error | DetailedError>()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (processing && data?.createCloudflareVideoUploadByFile?.id != null) {
      void getMyCloudflareVideo({
        variables: { id: data.createCloudflareVideoUploadByFile.id }
      })
    }
  }, [
    processing,
    getMyCloudflareVideo,
    data?.createCloudflareVideoUploadByFile?.id
  ])

  useEffect(() => {
    if (
      getMyCloudflareVideoData?.getMyCloudflareVideo?.readyToStream === true &&
      data?.createCloudflareVideoUploadByFile?.id != null
    ) {
      onChange(data.createCloudflareVideoUploadByFile.id)
    }
  }, [
    getMyCloudflareVideoData?.getMyCloudflareVideo?.readyToStream,
    data?.createCloudflareVideoUploadByFile?.id,
    onChange
  ])

  const onDropAccepted = async (files: File[]): Promise<void> => {
    if (files.length > 0) {
      const file = files[0]
      const fileName = file.name.split('.')[0]
      console.log(fileName)
      const { data } = await createCloudflareVideoUploadByFile({
        variables: {
          uploadLength: file.size,
          name: fileName
        }
      })

      if (
        data?.createCloudflareVideoUploadByFile?.uploadUrl != null &&
        data?.createCloudflareVideoUploadByFile?.id != null
      ) {
        setUploading(true)
        // the following if statement is required for testing in jest
        let buffer: ReadStream | File
        if (process.env.NODE_ENV === 'test') {
          /* eslint-disable @typescript-eslint/no-var-requires */
          buffer = require('fs').createReadStream(
            require('path').join(
              __dirname,
              (file as unknown as { path: string }).path
            )
          )
          /* eslint-enable @typescript-eslint/no-var-requires */
        } else {
          buffer = file
        }
        const upload = new Upload(buffer, {
          httpStack: httpStack ?? new DefaultHttpStack({}),
          uploadUrl: data.createCloudflareVideoUploadByFile.uploadUrl,
          chunkSize: 150 * 1024 * 1024,
          onSuccess: (): void => {
            setUploading(false)
            setProcessing(true)
          },
          onError: (err): void => {
            setError(err)
            setUploading(false)
            setProgress(0)
          },
          onProgress(bytesUploaded, bytesTotal): void {
            setProgress((bytesUploaded / bytesTotal) * 100)
          }
        })
        upload.start()
      }
    }
  }


  const onDropRejected = async (fileRejections: FileRejections[]): Promise<void> => {
    setfileRejected(true)
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach(e => {
        if(e.code === "file-invalid-type"){
          setfileInvalidType(true)
        }
        if(e.code === "file-too-large"){
          setfileTooLarge(true)
        }

        if(e.code === "too-many-files"){
          settooManyFiles(true)
        }
      })
    })
  } 

  const { getRootProps, open, getInputProps, isDragAccept} = useDropzone({
    onDropAccepted,
    onDropRejected, 
    // onError,
    noClick: true,
    multiple: false,
    maxSize: 1000000000,
    accept: {
      'video/*': []
    }
  })

  const noBorder = error != null || uploading || fileRejected

  return (
    <Stack alignItems="center" gap={1} sx={{ px: 6, py: 3 }}>
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
          <CloudOffRoundedIcon
            sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
          />
        ) : (
          <BackupOutlinedIcon
            sx={{ fontSize: 48, color: 'secondary.light', mb: 1 }}
          />
        )}
        <Typography
          variant="body1"
          color={error != null || fileRejected ? 'error.main' : 'secondary.main'}
          sx={{ pb: 4 }}
        >
          {uploading && 'Uploading...'}
          {processing && 'Processing...'}
          {error != null || fileRejected && 'Upload Failed!'}
          {!uploading && !processing && !fileRejected && error == null && 'Drop a video here'}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={error != null || fileRejected ? 'error.main' : 'secondary.light'}
      >
        <WarningAmberRounded
          fontSize="small"
          sx={{
            display: error != null || fileRejected ? 'flex' : 'none'
          }}
        />
        {/* <Typography variant="caption">
          {error != null && error.name === 'InvalidCharacterError' ? 'Invalid character in file name' : null}
        </Typography> */}
        <Typography variant="caption">
          {error != null || fileRejected 
            ? 'Something went wrong, try again'
            : 'Max size is 1 GB'}
        </Typography>
      </Stack>
      {fileRejected ? (
        <Stack
              direction="row"
              spacing={1}
              color={error != null || fileRejected ? 'error.main' : 'secondary.light'}
            >
          <WarningAmberRounded
                fontSize="small"
                sx={{
                  display: error != null || fileRejected ? 'flex' : 'none'
                }}
              />
          {/* <Typography variant="caption">
                {error != null && error.name === 'InvalidCharacterError' ? 'Invalid character in file name' : null}
              </Typography> */}
          <Typography variant="caption">
            {fileInvalidType && 'File is Invalid type. '}
            {fileTooLarge && 'File is too large. '}
            {tooManyFiles && 'Only one file upload at once.'}
          </Typography>
        </Stack>
      ) : ''}

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
            Upload file
          </Typography>
        </Button>
      )}
    </Stack>
  )
}
