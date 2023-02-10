import { ReactElement, useEffect, useState } from 'react'
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
  onChange: (src: string) => void
  loading?: boolean
}

export function ImageUpload({
  onChange,
  loading = false
}: ImageUploadProps): ReactElement {
  const [text, setText] = useState('upload') // upload | loading | success | failure

  useEffect(() => {
    if (loading) {
      setText('loading')
      console.log('hehe')
    }
  }, [loading, text])

  const { data } = useQuery<CloudflareUploadUrl>(CLOUDFLARE_UPLOAD_URL)

  const onDrop = async (acceptedFiles): Promise<void> => {
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
    if (response.success === true) {
      setText('success')
    }
    const src = `https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/${response.result.id}/format=webp`
    onChange(src)
  }

  const { getRootProps, open, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    maxSize: 10485760,
    accept: 'image/*'
  })

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
          {/* {text === 'upload'
            ? 'Drop an image here'
            : text === 'loading'
            ? 'Uploading...'
            : text === 'success'
            ? 'Upload successful!'
            : 'Upload failed!'} */}
          {text}
        </Typography>
      </Box>
      <Typography variant="caption" color="secondary.light">
        The maximum size per file is 10 MB
      </Typography>
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
