import { ReactElement, useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useQuery } from '@apollo/client'
import fetch from 'node-fetch'
import { CloudflareUploadUrl } from '../../../../../../__generated__/CloudflareUploadUrl'

export const CLOUDFLARE_UPLOAD_URL = gql`
  query CloudflareUploadUrl {
    createCloudflareImage {
      uploadUrl
      id
    }
  }
`

interface ImageUploadProps {
  maxFileSize?: number
  onChange: (src: string) => void
}

export function ImageUpload({
  maxFileSize = 10,
  onChange
}: ImageUploadProps): ReactElement {
  const { data } = useQuery<CloudflareUploadUrl>(CLOUDFLARE_UPLOAD_URL)

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (data?.createCloudflareImage == null) return
      const file = acceptedFiles[0]

      const formData = new FormData()
      formData.set('file', file)

      console.log(acceptedFiles[0])

      const response = await (
        await fetch(data?.createCloudflareImage?.uploadUrl, {
          method: 'POST',
          body: formData
        })
      ).json()

      setMessage(acceptedFiles[0].name)
      console.log(response)
      const src = `https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/${response.result.id}/public`
      onChange(src)
    },
    [data, onChange]
  )

  const {
    getRootProps,
    open,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: 1,
    accept: 'image/*'
  })

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
    <Stack {...getRootProps()} alignItems="center">
      <input {...getInputProps()} />
      <Box
        data-testid="drop zone"
        sx={{
          mt: 3,
          width: '100%',
          height: '162px',
          borderWidth: '2px',
          backgroundColor: 'background.default',
          borderColor: 'divider',
          borderStyle: 'dashed',
          borderRadius: '0.5rem',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          alignItems: 'center',
          display: 'flex'
        }}
      >
        <BackupOutlinedIcon
          sx={{ fontSize: '48px', color: 'secondary.light', mb: 1 }}
        />
        <Typography variant="body1" sx={{ pb: 4 }}>
          Drop an image here
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
          mt: 6,
          height: '32px',
          width: '100%',
          borderColor: 'secondary.light',
          borderWidth: '1px',
          borderRadius: '8px'
        }}
      >
        <Typography
          variant="subtitle2"
          fontSize="14px"
          sx={{ color: 'secondary.main' }}
        >
          Upload file
        </Typography>
      </Button>
    </Stack>
  )
}
