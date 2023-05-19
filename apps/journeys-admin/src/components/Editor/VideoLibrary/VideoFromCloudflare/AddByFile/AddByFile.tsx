import type { ReadStream } from 'fs'
import { ReactElement, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useMutation } from '@apollo/client'
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded'
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded'
import {
  DefaultHttpStack,
  DetailedError,
  HttpStack,
  Upload
} from 'tus-js-client'
import LinearProgress from '@mui/material/LinearProgress'
import { CreateCloudflareVideoUploadByFile } from '../../../../../../__generated__/CreateCloudflareVideoUploadByFile'

export const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE = gql`
  mutation CreateCloudflareVideoUploadByFile(
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

interface AddByFileProps {
  onChange: (id: string) => void
  httpStack?: HttpStack // required for testing in jest
}

export function AddByFile({
  onChange,
  httpStack
}: AddByFileProps): ReactElement {
  const [createCloudflareVideoUploadByFile] =
    useMutation<CreateCloudflareVideoUploadByFile>(
      CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE
    )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | DetailedError>()
  const [progress, setProgress] = useState(0)

  const onDrop = async (acceptedFiles: File[]): Promise<void> => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const { data } = await createCloudflareVideoUploadByFile({
        variables: {
          uploadLength: file.size,
          name: file.name.split('.')[0]
        }
      })

      if (
        data?.createCloudflareVideoUploadByFile?.uploadUrl != null &&
        data?.createCloudflareVideoUploadByFile?.id != null
      ) {
        setLoading(true)
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
            if (data.createCloudflareVideoUploadByFile?.id != null)
              onChange(data.createCloudflareVideoUploadByFile.id)
            setLoading(false)
            setProgress(0)
          },
          onError: (err): void => {
            setError(err)
            setLoading(false)
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

  const { getRootProps, open, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    noClick: true,
    maxSize: 10485760000,
    accept: {
      'video/*': []
    }
  })

  const noBorder = error != null || loading

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
            isDragAccept || loading
              ? 'rgba(239, 239, 239, 0.9)'
              : error != null
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
        {error != null ? (
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
          color={error != null ? 'error.main' : 'secondary.main'}
          sx={{ pb: 4 }}
        >
          {loading
            ? 'Uploading...'
            : error != null
            ? 'Upload Failed!'
            : 'Drop a video here'}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        color={error != null ? 'error.main' : 'secondary.light'}
      >
        <WarningAmberRounded
          fontSize="small"
          sx={{
            display: error != null ? 'flex' : 'none'
          }}
        />
        <Typography variant="caption">
          {error != null
            ? 'Something went wrong, try again'
            : 'Max length is 30 minutes'}
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ width: '100%', mt: 4 }}>
          <LinearProgress
            variant="determinate"
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
