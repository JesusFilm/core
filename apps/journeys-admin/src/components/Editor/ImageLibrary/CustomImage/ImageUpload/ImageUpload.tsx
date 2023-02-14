import { ReactElement, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Typography from '@mui/material/Typography'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { gql, useQuery } from '@apollo/client'
import fetch from 'node-fetch'
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
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
  loading
}: ImageUploadProps): ReactElement {
  const { data, refetch } = useQuery<CloudflareUploadUrl>(CLOUDFLARE_UPLOAD_URL)
  const [success, setSuccess] = useState<boolean>()

  const onDrop = async (acceptedFiles): Promise<void> => {
    if (data?.createCloudflareImage == null) return
    const file = acceptedFiles[0]

    const formData = new FormData()
    formData.set('file', file)

    const response = await (
      await fetch(data?.createCloudflareImage?.uploadUrl, {
        method: 'POST',
        body: formData
      })
    ).json()

    response.success === true ? setSuccess(true) : setSuccess(false)
    if (response.errors.length !== 0) {
      setSuccess(false)
    }

    const src = `https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/${
      response.result.id as string
    }/public`
    onChange(src)

    await refetch()
  }

  const { getRootProps, open, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    maxSize: 10485760,
    accept: {
      'image/*': []
    }
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
        {loading === false && success === true ? (
          <CloudDoneOutlinedIcon
            sx={{ fontSize: '48px', color: 'secondary.light', mb: 1 }}
          />
        ) : loading === false && success === false ? (
          <CloudOffOutlinedIcon
            sx={{ fontSize: '48px', color: 'secondary.light', mb: 1 }}
          />
        ) : (
          <BackupOutlinedIcon
            sx={{ fontSize: '48px', color: 'secondary.light', mb: 1 }}
          />
        )}
        <Typography variant="body1" sx={{ pb: 4 }}>
          {loading === false && success === true
            ? 'Upload successful!'
            : loading === true
            ? 'Uploading...'
            : success === false
            ? 'Upload Failed!'
            : 'Drop an image here'}
        </Typography>
      </Box>
      <Typography variant="caption" color="secondary.light">
        Max file size: 10 MB
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
