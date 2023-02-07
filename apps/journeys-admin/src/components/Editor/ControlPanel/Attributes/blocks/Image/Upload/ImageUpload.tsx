import { ReactElement, useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useQuery } from '@apollo/client'
import { CloudflareUploadUrl } from '../../../../../../../../__generated__/CloudflareUploadUrl'

export const CLOUDFLARE_UPLOAD_URL = gql`
  query CloudflareUploadUrl {
    createCloudflareImage {
      uploadUrl
      id
    }
  }
`

export interface ImageUploadProps {
  maxFileSize?: number
}

export function ImageUpload({
  maxFileSize = 10
}: ImageUploadProps): ReactElement {
  const onDrop = useCallback((acceptedFiles) => {
    handleMessage(acceptedFiles[0].name)
  }, [])

  const { data } = useQuery<CloudflareUploadUrl>(CLOUDFLARE_UPLOAD_URL)

  const { getRootProps, open, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      noClick: true,
      maxFiles: 1,
      accept: {
        'image/jpeg': [],
        'image/png': [],
        'image/jpg': []
      }
    })

  function handleMessage(fileName: string): void {
    setMessage(fileName)
  }

  const [message, setMessage] = useState('Drop an image here')

  const style = useMemo(() => {
    const activeStyle = {
      borderColor: '#ffffff'
    }

    const acceptStyle = {
      borderColor: '#005a9c'
    }

    const rejectStyle = {
      borderColor: '#ff1744'
    }

    return {
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }
  }, [isDragActive, isDragAccept, isDragReject])

  return (
    <Stack alignItems="center">
      <Box
        {...getRootProps({ style })}
        data-testid="drop zone"
        sx={{
          mt: 3,
          minHeight: '217px',
          borderWidth: '2px',
          backgroundColor: 'background.default',
          borderColor: 'divider',
          borderStyle: 'dashed',
          borderRadius: '0.5rem',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          alignItems: 'center',
          display: 'flex',
          width: '100%'
        }}
      >
        <BackupOutlinedIcon
          fontSize="large"
          sx={{ color: 'secondary.light' }}
        />
        <Typography variant="body1" sx={{ pb: 4 }}>
          {message}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="secondary.light"
      >{`The maximum size per file is ${maxFileSize} MB`}</Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={open}
        color="secondary"
        sx={{
          width: '100%',
          borderColor: 'secondary.light',
          borderWidth: '1px',
          borderRadius: '8px'
        }}
      >
        Upload file
      </Button>
    </Stack>
  )
}
